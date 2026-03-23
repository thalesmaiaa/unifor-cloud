def test_create_project(client, auth_headers):
    response = client.post("/api/projects/", json={
        "name": "Test Project",
        "description": "A test project",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["status"] == "planning"


def test_list_projects(client, auth_headers):
    # Create two projects
    client.post("/api/projects/", json={"name": "Project 1"}, headers=auth_headers)
    client.post("/api/projects/", json={"name": "Project 2"}, headers=auth_headers)

    response = client.get("/api/projects/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["projects"]) == 2


def test_list_projects_with_search(client, auth_headers):
    client.post("/api/projects/", json={"name": "Alpha Project"}, headers=auth_headers)
    client.post("/api/projects/", json={"name": "Beta Project"}, headers=auth_headers)

    response = client.get("/api/projects/?search=Alpha", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["projects"][0]["name"] == "Alpha Project"


def test_get_project(client, auth_headers):
    create_resp = client.post("/api/projects/", json={"name": "My Project"}, headers=auth_headers)
    project_id = create_resp.json()["id"]

    response = client.get(f"/api/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "My Project"


def test_update_project(client, auth_headers):
    create_resp = client.post("/api/projects/", json={"name": "Old Name"}, headers=auth_headers)
    project_id = create_resp.json()["id"]

    response = client.put(f"/api/projects/{project_id}", json={
        "name": "New Name",
        "status": "active",
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    assert response.json()["status"] == "active"


def test_delete_project(client, auth_headers):
    create_resp = client.post("/api/projects/", json={"name": "Delete Me"}, headers=auth_headers)
    project_id = create_resp.json()["id"]

    response = client.delete(f"/api/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 204

    response = client.get(f"/api/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 404


def test_project_not_found(client, auth_headers):
    response = client.get("/api/projects/99999", headers=auth_headers)
    assert response.status_code == 404


def test_project_unauthorized(client):
    response = client.get("/api/projects/")
    assert response.status_code == 401


def test_admin_sees_all_projects(client, auth_headers, admin_headers):
    # User creates a project
    client.post("/api/projects/", json={"name": "User Project"}, headers=auth_headers)

    # Admin should see it
    response = client.get("/api/projects/", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1
