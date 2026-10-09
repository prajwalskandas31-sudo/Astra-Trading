Build a simple Super Admin Terminal with secure login access.

Super Admin Features

The Super Admin should be able to:

Log in securely to the Super Admin Terminal.
Add new users along with their phone numbers.
Easily integrate and manage the user’s broker account while adding the user.
View a list of all registered users, their phone numbers, broker integration status, and account status.
Revoke or restore a user’s access to the terminal.
Enable or disable Live Order Placement using a simple button/toggle:
Enabled: Live order placement is active for that user.
Disabled: Live order placement is completely stopped for that user.
Enable or disable WhatsApp and Telegram alerts for each user.
Manage all user, broker, order-placement, and notification settings from one place.
User & Broker Setup

When adding a new user, the Super Admin should have a simple setup flow:

Enter the user's name and phone number.
Select the user's broker.
Connect/integrate the user's broker account through the supported broker authentication process.
Verify that the broker account has been successfully connected.
Configure Live Order Placement.
Configure WhatsApp and/or Telegram alerts.
Save the user.

The system should clearly display whether the broker account is Connected, Disconnected, or Requires Reauthorization.

Broker credentials, API keys, access tokens, and other sensitive authentication information must be handled securely and should not be exposed in the user interface.

Live Order Placement

The Super Admin should have a clear ON/OFF toggle for each user:

ON: The system is permitted to place live orders through that user's connected broker account.
OFF: The system must not place any live orders for that user.

The default state for a newly added user should preferably be OFF until the Super Admin explicitly enables it.

Alerts

The Super Admin should be able to independently enable or disable:

WhatsApp alerts
Telegram alerts

Users should receive only the configured WhatsApp/Telegram alerts and should not have access to the Super Admin Terminal or its controls.

User Dashboard

For each user, the Super Admin should be able to see:

User name
Phone number
Broker name
Broker connection status
Live Order Placement: ON/OFF
WhatsApp Alerts: ON/OFF
Telegram Alerts: ON/OFF
User access: Active/Revoked

All controls should be simple, clearly labelled, and accessible from a single user-management interface.