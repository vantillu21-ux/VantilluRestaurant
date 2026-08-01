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
