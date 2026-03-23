def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "email": "new@test.com",
        "full_name": "New User",
        "password": "password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@test.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "user"


def test_register_duplicate_email(client, test_user):
    response = client.post("/api/auth/register", json={
        "email": "user@test.com",
        "full_name": "Another User",
        "password": "password123",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_invalid_email(client):
    response = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "full_name": "Test",
        "password": "password123",
    })
    assert response.status_code == 422


def test_register_short_password(client):
    response = client.post("/api/auth/register", json={
        "email": "test@test.com",
        "full_name": "Test",
        "password": "12345",
    })
    assert response.status_code == 422


def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={
        "email": "nobody@test.com",
        "password": "password123",
    })
    assert response.status_code == 401


def test_get_me(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@test.com"
    assert data["id"] == test_user.id


def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
