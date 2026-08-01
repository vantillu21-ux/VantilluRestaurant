import psycopg2
conn = psycopg2.connect('postgresql://postgres.lxraykzitlqfjxythgkd:Vantillu123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
print('Tables in Supabase:', cur.fetchall())
cur.execute("SELECT COUNT(*) FROM orders")
print('Orders in Supabase:', cur.fetchone()[0])
