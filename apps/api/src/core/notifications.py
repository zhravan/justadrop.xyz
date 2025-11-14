"""
Notification utility module.
Currently uses logging as placeholder - will be replaced with email/SMS later.
"""

import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None
) -> bool:
    """
    Send email notification (placeholder).
    
    TODO: Implement actual email sending using services like:
    - SendGrid
    - AWS SES
    - Mailgun
    - SMTP
    """
    logger.info(f"""
    ═══════════════════════════════════════════
    📧 EMAIL NOTIFICATION (Placeholder)
    ═══════════════════════════════════════════
    To: {to_email}
    From: {from_email or 'noreply@justadrop.xyz'}
    Subject: {subject}
    ───────────────────────────────────────────
    {body}
    ═══════════════════════════════════════════
    Timestamp: {datetime.utcnow().isoformat()}
    """)
    return True


def notify_application_submitted(volunteer_email: str, opportunity_title: str) -> bool:
    """Notify volunteer that their application was submitted."""
    return send_email(
        to_email=volunteer_email,
        subject='Application Submitted Successfully',
        body=f"""
Hello,

Your application for "{opportunity_title}" has been submitted successfully.

You will be notified once the organization reviews your application.

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_application_approved(volunteer_email: str, opportunity_title: str, org_name: str) -> bool:
    """Notify volunteer that their application was approved."""
    return send_email(
        to_email=volunteer_email,
        subject='Application Approved! 🎉',
        body=f"""
Congratulations!

Your application for "{opportunity_title}" at {org_name} has been approved.

Please check your dashboard for next steps and contact information.

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_application_rejected(volunteer_email: str, opportunity_title: str, notes: Optional[str] = None) -> bool:
    """Notify volunteer that their application was rejected."""
    body = f"""
Hello,

Thank you for your interest in "{opportunity_title}".

Unfortunately, your application was not selected at this time.

{f"Feedback: {notes}" if notes else ""}

We encourage you to explore other opportunities on our platform.

Best regards,
Just a Drop Team
    """.strip()
    
    return send_email(
        to_email=volunteer_email,
        subject='Application Update',
        body=body
    )


def notify_new_application(org_email: str, volunteer_name: str, opportunity_title: str) -> bool:
    """Notify organization of new application."""
    return send_email(
        to_email=org_email,
        subject='New Volunteer Application',
        body=f"""
Hello,

You have received a new application for "{opportunity_title}".

Applicant: {volunteer_name}

Please log in to your dashboard to review the application.

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_completion_requested(org_email: str, volunteer_name: str, opportunity_title: str, hours: float) -> bool:
    """Notify organization that volunteer marked work as complete."""
    return send_email(
        to_email=org_email,
        subject='Volunteer Work Completion Pending Review',
        body=f"""
Hello,

{volunteer_name} has marked their volunteer work as complete for "{opportunity_title}".

Hours logged: {hours}

Please review and approve/reject in your dashboard.

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_completion_approved(volunteer_email: str, opportunity_title: str, hours: float) -> bool:
    """Notify volunteer that their completion was approved."""
    return send_email(
        to_email=volunteer_email,
        subject='Volunteer Work Approved! ✅',
        body=f"""
Congratulations!

Your volunteer work for "{opportunity_title}" has been approved.

Hours credited: {hours}

This has been added to your volunteer history. Thank you for making a difference!

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_completion_rejected(volunteer_email: str, opportunity_title: str, notes: Optional[str] = None) -> bool:
    """Notify volunteer that their completion was rejected."""
    body = f"""
Hello,

Your completion request for "{opportunity_title}" requires review.

{f"Note from organization: {notes}" if notes else ""}

Please contact the organization for clarification.

Best regards,
Just a Drop Team
    """.strip()
    
    return send_email(
        to_email=volunteer_email,
        subject='Completion Review Required',
        body=body
    )


def notify_organization_verified(org_email: str, org_name: str) -> bool:
    """Notify organization that they have been verified."""
    return send_email(
        to_email=org_email,
        subject='Organization Verified! ✓',
        body=f"""
Congratulations {org_name}!

Your organization has been verified by Just a Drop administrators.

You can now:
- Post volunteer opportunities
- Manage applications
- Build your volunteer roster

Log in to your dashboard to get started!

Best regards,
Just a Drop Team
        """.strip()
    )


def notify_organization_rejected(org_email: str, org_name: str, notes: Optional[str] = None) -> bool:
    """Notify organization that verification was rejected."""
    body = f"""
Hello {org_name},

Your organization verification request has been reviewed.

{f"Admin notes: {notes}" if notes else ""}

If you believe this is an error or would like to provide additional information,
please contact us at support@justadrop.xyz.

Best regards,
Just a Drop Team
    """.strip()
    
    return send_email(
        to_email=org_email,
        subject='Organization Verification Update',
        body=body
    )

