from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

def test_get_activities():
    # Arrange: Ensure an activity exists in the state
    activity_name = "Chess Club"
    assert activity_name in activities

    # Act: Request all activities
    response = client.get("/activities")

    # Assert: Validate response structure and content
    assert response.status_code == 200
    data = response.json()
    assert activity_name in data
    assert "participants" in data[activity_name]


def test_signup_successful():
    # Arrange: Choose activity and new participant email
    activity_name = "Basketball Team"
    new_email = "new_student@mergington.edu"
    if new_email in activities[activity_name]["participants"]:
        activities[activity_name]["participants"].remove(new_email)

    # Act: Register the student
    response = client.post(f"/activities/{activity_name}/signup?email={new_email}")

    # Assert: Verify registration succeeded and list updated
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {new_email} for {activity_name}"
    assert new_email in activities[activity_name]["participants"]


def test_signup_duplicate_fails():
    # Arrange: Existing participant in Chess Club
    activity_name = "Chess Club"
    existing_email = "michael@mergington.edu"
    assert existing_email in activities[activity_name]["participants"]

    # Act: Attempt to sign up the same participant again
    response = client.post(f"/activities/{activity_name}/signup?email={existing_email}")

    # Assert: Verify rejection with 400 Bad Request
    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"


def test_signup_activity_not_found():
    # Arrange: Non-existent activity name
    invalid_activity = "Nonexistent Club"

    # Act: Attempt to sign up
    response = client.post(f"/activities/{invalid_activity}/signup?email=test@mergington.edu")

    # Assert: Verify 404 response
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_successful():
    # Arrange: Add a participant to unregister
    activity_name = "Programming Class"
    email_to_remove = "temp_student@mergington.edu"
    if email_to_remove not in activities[activity_name]["participants"]:
        activities[activity_name]["participants"].append(email_to_remove)

    # Act: Call DELETE endpoint
    response = client.delete(f"/activities/{activity_name}/signup?email={email_to_remove}")

    # Assert: Verify removal
    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email_to_remove} from {activity_name}"
    assert email_to_remove not in activities[activity_name]["participants"]