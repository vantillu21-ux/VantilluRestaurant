from datetime import datetime, timezone
import json
from flask import Blueprint, jsonify
from repositories.order_repository import OrderRepository
from middleware.auth import admin_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('', methods=['GET'])
@admin_required
def get_analytics():
    """Calculates administrative dashboard stats including day-wise, monthly, and yearly revenue/orders."""
    try:
        orders = OrderRepository.all()
        
        # Calculate overall stats
        completed_orders = [o for o in orders if o.status == 'Completed']
        total_revenue = sum(o.grand_total for o in completed_orders)
        total_orders = len(orders)
        
        pending_count = len([o for o in orders if o.status == 'Pending'])
        accepted_count = len([o for o in orders if o.status == 'Accepted'])
        preparing_count = len([o for o in orders if o.status == 'Preparing'])
        ready_count = len([o for o in orders if o.status == 'Ready'])
        served_count = len([o for o in orders if o.status == 'Served'])
        completed_count = len(completed_orders)
        cancelled_count = len([o for o in orders if o.status == 'Cancelled'])
        
        # Day-wise, monthly, and yearly aggregation dictionaries
        day_stats = {}
        month_stats = {}
        year_stats = {}
        
        for o in completed_orders:
            created_at = o.created_at
            if not created_at:
                continue
                
            day_str = created_at.strftime('%Y-%m-%d')
            month_str = created_at.strftime('%Y-%m')
            year_str = created_at.strftime('%Y')
            
            # Day-wise aggregation
            if day_str not in day_stats:
                day_stats[day_str] = {"revenue": 0.0, "orders": 0, "customers": set()}
            day_stats[day_str]["revenue"] += o.grand_total
            day_stats[day_str]["orders"] += 1
            day_stats[day_str]["customers"].add(o.phone)
            
            # Monthly aggregation
            if month_str not in month_stats:
                month_stats[month_str] = {"revenue": 0.0, "orders": 0}
            month_stats[month_str]["revenue"] += o.grand_total
            month_stats[month_str]["orders"] += 1
            
            # Yearly aggregation
            if year_str not in year_stats:
                year_stats[year_str] = {"revenue": 0.0, "orders": 0}
            year_stats[year_str]["revenue"] += o.grand_total
            year_stats[year_str]["orders"] += 1
            
        # Convert aggregations to sorted lists
        day_wise = []
        for d, s in sorted(day_stats.items(), reverse=True):
            day_wise.append({
                "date": d,
                "revenue": round(s["revenue"], 2),
                "orders": s["orders"],
                "customers": len(s["customers"])
            })
            
        monthly = []
        for m, s in sorted(month_stats.items(), reverse=True):
            monthly.append({
                "month": m,
                "revenue": round(s["revenue"], 2),
                "orders": s["orders"]
            })
            
        yearly = []
        for y, s in sorted(year_stats.items(), reverse=True):
            yearly.append({
                "year": y,
                "revenue": round(s["revenue"], 2),
                "orders": s["orders"]
            })
            
        # Calculate dish popularity counts
        dish_counts = {}
        for o in orders:
            try:
                items_list = json.loads(o.items)
                for item in items_list:
                    name = item.get('name')
                    qty = int(item.get('quantity', 1))
                    dish_counts[name] = dish_counts.get(name, 0) + qty
            except Exception:
                continue
                
        popular_dishes = [
            {'name': k, 'orders': v} 
            for k, v in sorted(dish_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Get count of orders registered today
        today_str = datetime.now(timezone.utc).date().isoformat()
        today_orders_count = len([
            o for o in orders 
            if o.created_at and o.created_at.date().isoformat() == today_str
        ])
        
        stats = {
            'revenue': total_revenue,
            'total_orders': total_orders,
            'today_orders_count': today_orders_count,
            'status_counts': {
                'Pending': pending_count,
                'Accepted': accepted_count,
                'Preparing': preparing_count,
                'Ready': ready_count,
                'Served': served_count,
                'Completed': completed_count,
                'Cancelled': cancelled_count
            },
            'popular_dishes': popular_dishes,
            'day_wise': day_wise,
            'monthly': monthly,
            'yearly': yearly
        }
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": f"Failed to generate stats: {e}"}), 500
