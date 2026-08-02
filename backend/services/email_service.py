import os
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from utils.logger import logger

class EmailService:
    @staticmethod
    def send_otp_email(recipient_email: str, otp: str):
        api_key = os.environ.get('BREVO_API_KEY')
        email_from = os.environ.get('EMAIL_FROM', 'vantillu21@gmail.com')
        email_from_name = os.environ.get('EMAIL_FROM_NAME', 'Vantillu Restaurant')

        if not api_key:
            logger.error("[EMAIL] BREVO_API_KEY not configured. Cannot send email.")
            return False

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

        subject = "Vantillu Password Reset OTP"
        
        # HTML template as per requirements
        html_content = f"""<h2>Vantillu Restaurant</h2>

<p>Your password reset code is</p>

<h1>{otp}</h1>

<p>This OTP expires in 10 minutes.</p>

<p>If you didn't request this, ignore this email.</p>"""

        sender = {"name": email_from_name, "email": email_from}
        to = [{"email": recipient_email}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            html_content=html_content,
            sender=sender,
            subject=subject
        )

        logger.info(f"[EMAIL] Recipient: {recipient_email}")
        logger.info(f"[EMAIL] Subject: {subject}")
        logger.info(f"[EMAIL] OTP generated (length 6)")
        logger.info(f"[EMAIL] Brevo request initiated")

        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            logger.info(f"[EMAIL] Brevo response: {api_response}")
            logger.info(f"[EMAIL] Email sent successfully to {recipient_email}")
            return True
        except ApiException as e:
            logger.error(f"[EMAIL] API error: {e}")
            return False

    @staticmethod
    def send_customer_otp_email(recipient_email: str, otp: str):
        api_key = os.environ.get('BREVO_API_KEY')
        email_from = os.environ.get('EMAIL_FROM', 'vantillu21@gmail.com')
        email_from_name = os.environ.get('EMAIL_FROM_NAME', 'Vantillu Restaurant')

        if not api_key:
            logger.error("[EMAIL] BREVO_API_KEY not configured. Cannot send email.")
            return False

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

        subject = "Vantillu Restaurant Verification Code"
        
        # HTML template as per requirements
        html_content = f"""<p>Hello,</p>

<p>Your verification code is</p>

<h1>{otp}</h1>

<p>This code expires in 10 minutes.</p>

<p>Do not share this code with anyone.</p>

<p>Regards,<br>Vantillu Restaurant</p>"""

        sender = {"name": email_from_name, "email": email_from}
        to = [{"email": recipient_email}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            html_content=html_content,
            sender=sender,
            subject=subject
        )

        logger.info(f"[EMAIL] Recipient: {recipient_email}")
        logger.info(f"[EMAIL] Subject: {subject}")
        logger.info(f"[EMAIL] OTP generated (length 6)")
        logger.info(f"[EMAIL] Brevo request initiated")

        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            logger.info(f"[EMAIL] Brevo response: {api_response}")
            logger.info(f"[EMAIL] Email sent successfully to {recipient_email}")
            return True
        except ApiException as e:
            logger.error(f"[EMAIL] API error: {e}")
            return False

    @staticmethod
    def send_order_confirmation_email(order_dict: dict, admin_email: str):
        api_key = os.environ.get('BREVO_API_KEY')
        email_from = os.environ.get('EMAIL_FROM', 'vantillu21@gmail.com')
        email_from_name = os.environ.get('EMAIL_FROM_NAME', 'Vantillu Restaurant')

        if not api_key:
            logger.error("[EMAIL] BREVO_API_KEY not configured. Cannot send order confirmation email.")
            return False

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

        customer_email = order_dict.get('customer_email')
        if not customer_email:
            logger.error("[EMAIL] Order has no customer_email. Cannot send order confirmation.")
            return False

        subject = f"Order Confirmation - Vantillu Restaurant (#{order_dict.get('order_number')})"
        
        # Build Items HTML
        items_html = "<ul>"
        for item in order_dict.get('items', []):
            items_html += f"<li>{item.get('quantity')}x {item.get('name')} - ₹{item.get('price')}</li>"
        items_html += "</ul>"

        html_content = f"""<h2>Thank you for your order, {order_dict.get('customer_name')}!</h2>
<p>We have received your order <strong>#{order_dict.get('order_number')}</strong>.</p>
<p><strong>Order Summary:</strong></p>
{items_html}
<p><strong>Subtotal:</strong> ₹{order_dict.get('subtotal')}</p>
<p><strong>Grand Total:</strong> ₹{order_dict.get('grand_total')}</p>
<p>We'll notify you as soon as there's an update on your order status.</p>
<p>Regards,<br>Vantillu Restaurant</p>"""

        sender = {"name": email_from_name, "email": email_from}
        # Send to customer, BCC to admin
        to = [{"email": customer_email}]
        bcc = [{"email": admin_email}] if admin_email else None
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            bcc=bcc,
            html_content=html_content,
            sender=sender,
            subject=subject
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
            logger.info(f"[EMAIL] Order confirmation sent to {customer_email} and {admin_email}")
            return True
        except ApiException as e:
            logger.error(f"[EMAIL] API error: {e}")
            return False

    @staticmethod
    def send_order_status_email(order_dict: dict, new_status: str):
        api_key = os.environ.get('BREVO_API_KEY')
        email_from = os.environ.get('EMAIL_FROM', 'vantillu21@gmail.com')
        email_from_name = os.environ.get('EMAIL_FROM_NAME', 'Vantillu Restaurant')

        if not api_key:
            return False

        customer_email = order_dict.get('customer_email')
        if not customer_email:
            return False

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

        subject = f"Order Update: {new_status} - Vantillu Restaurant (#{order_dict.get('order_number')})"
        
        html_content = f"""<h2>Hi {order_dict.get('customer_name')},</h2>
<p>Your order <strong>#{order_dict.get('order_number')}</strong> is now: <strong>{new_status}</strong></p>
<p>Thank you for dining with Vantillu Restaurant!</p>
<p>Regards,<br>Vantillu Restaurant</p>"""

        sender = {"name": email_from_name, "email": email_from}
        to = [{"email": customer_email}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            html_content=html_content,
            sender=sender,
            subject=subject
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
            logger.info(f"[EMAIL] Order status ({new_status}) sent to {customer_email}")
            return True
        except ApiException as e:
            logger.error(f"[EMAIL] API error: {e}")
            return False
