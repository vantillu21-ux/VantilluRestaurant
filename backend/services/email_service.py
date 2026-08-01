import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from utils.logger import logger

class EmailService:
    @staticmethod
    def send_otp_email(recipient_email: str, otp: str):
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_email = os.environ.get('SMTP_EMAIL')
        smtp_password = os.environ.get('SMTP_PASSWORD')

        if not smtp_email or not smtp_password:
            logger.error("SMTP credentials not configured. Cannot send email.")
            # For testing without credentials, we might log the OTP but we shouldn't according to rules.
            # But we'll just return False
            return False

        subject = "Vantillu Admin Password Reset"
        body = f"""Your OTP is

{otp}

Valid for 10 minutes.

Do not share this code."""

        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
            logger.info(f"OTP email sent successfully to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send OTP email to {recipient_email}: {e}")
            return False
