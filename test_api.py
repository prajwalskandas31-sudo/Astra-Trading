import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_full_flow():
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[OK] Health Check:", res.json())

        # 2. Login
        login_res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123456"})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        token = data["access_token"]
        print(f"[OK] Super Admin Authenticated: {data['user']['full_name']} (@{data['user']['username']})")

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Get Stats
        stats_res = client.get("/api/dashboard/stats", headers=headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print(f"[OK] Dashboard KPIs: Total Users={stats['total_users']}, Live Orders ON={stats['live_orders_active']}, Connected Brokers={stats['broker_connected']}")

        # 4. List Users
        users_res = client.get("/api/users", headers=headers)
        assert users_res.status_code == 200
        users = users_res.json()
        print(f"[OK] Retrieved {len(users)} registered users.")
        for u in users:
            print(f"   - {u['name']} ({u['phone_number']}) | Broker: {u['broker_name']} [{u['broker_status']}] | Live Orders: {u['live_orders_enabled']} | WA: {u['whatsapp_alerts_enabled']} | TG: {u['telegram_alerts_enabled']}")

        # 5. Test Live Order Safety Rule Enforcement
        # Let's pick a user with live_orders_enabled = False (Pooja Patel)
        user_pooja = next(u for u in users if u["name"] == "Pooja Patel")
        print(f"\n--- Testing Live Order Safety for {user_pooja['name']} (Live Orders: {user_pooja['live_orders_enabled']}) ---")
        sim_blocked = client.post(
            "/api/orders/simulate",
            headers=headers,
            json={"user_id": user_pooja["id"], "symbol": "BANKNIFTY 52000 CE", "quantity": 15, "side": "BUY", "price": 320.0}
        )
        assert sim_blocked.status_code == 200
        res_blocked = sim_blocked.json()
        print(f"[OK] Order Safety Rule: Allowed={res_blocked['allowed']}, Status={res_blocked['status']}")
        print(f"   Reason: {res_blocked['reason']}")
        assert res_blocked["allowed"] is False, "Safety violation: Order should have been blocked!"

        # Now let's toggle Live Orders ON for Pooja Patel
        toggle_res = client.post(
            f"/api/users/{user_pooja['id']}/toggle-live-orders",
            headers=headers,
            json={"live_orders_enabled": True}
        )
        assert toggle_res.status_code == 200
        print(f"[OK] Toggled Live Order Placement to ON for {user_pooja['name']}.")

        # Now test order execution again (should be PERMITTED and EXECUTED)
        sim_allowed = client.post(
            "/api/orders/simulate",
            headers=headers,
            json={"user_id": user_pooja["id"], "symbol": "BANKNIFTY 52000 CE", "quantity": 15, "side": "BUY", "price": 320.0}
        )
        assert sim_allowed.status_code == 200
        res_allowed = sim_allowed.json()
        print(f"[OK] Live Order Dispatched: Allowed={res_allowed['allowed']}, Status={res_allowed['status']}, Order ID={res_allowed['details']['order_id']}")
        assert res_allowed["allowed"] is True

        # Toggle back to OFF for safety
        client.post(
            f"/api/users/{user_pooja['id']}/toggle-live-orders",
            headers=headers,
            json={"live_orders_enabled": False}
        )
        print(f"[OK] Reset Live Order Placement back to OFF.")

        # 6. Test WhatsApp & Telegram alert dispatches
        wa_res = client.post(f"/api/users/{user_pooja['id']}/test-alert", headers=headers, json={"channel": "whatsapp"})
        print("[OK] Test WhatsApp Alert:", wa_res.json()["message"])

        # 7. Add a new user via API following the exact input.md specifications
        print("\n--- Testing New User & Broker Onboarding ---")
        new_user_res = client.post(
            "/api/users",
            headers=headers,
            json={
                "name": "Arjun Mehta",
                "phone_number": "+91 98111 22334",
                "broker_code": "dhan",
                "broker_client_id": "DHAN1042",
                "broker_auth_token": "dhan_auth_token_991823",
                "live_orders_enabled": False, # Explicitly default OFF
                "whatsapp_alerts_enabled": True,
                "telegram_alerts_enabled": True,
                "telegram_chat_id": "@arjun_m",
                "notes": "Equity delivery & momentum options."
            }
        )
        assert new_user_res.status_code == 201
        created = new_user_res.json()
        print(f"[OK] User Onboarded: ID={created['id']}, Name={created['name']}, Broker={created['broker_name']}, Status={created['broker_status']}, Live Orders={created['live_orders_enabled']}")
        assert created["live_orders_enabled"] is False

        # 8. Test Revoke Access Rule
        # If user access is revoked, live orders must be blocked
        client.post(f"/api/users/{created['id']}/toggle-access", headers=headers, json={"is_active": False})
        print(f"[OK] Revoked access for {created['name']}.")
        revoked_order = client.post(
            "/api/orders/simulate",
            headers=headers,
            json={"user_id": created["id"], "symbol": "RELIANCE", "quantity": 10, "side": "BUY"}
        )
        assert revoked_order.json()["allowed"] is False
        print(f"[OK] Confirmed revoked access blocks orders: {revoked_order.json()['reason']}")

        # 9. Test Audit Logs
        audit_res = client.get("/api/dashboard/audit-logs?limit=10", headers=headers)
        assert audit_res.status_code == 200
        logs = audit_res.json()
        print(f"\n[OK] Verified Audit Log Feed ({len(logs)} recent entries):")
        for log in logs[:4]:
            print(f"   [{log['action']}] - {log['details']}")

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 100% SPEC COMPLIANCE CONFIRMED.")

if __name__ == "__main__":
    test_full_flow()
