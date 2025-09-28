# AI Interviewer API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Authentication is required for all endpoints. Include the authentication token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Candidates

#### Get All Candidates
- **Method**: GET
- **Route**: `/candidates`
- **Description**: Retrieve all candidates sorted by creation date
- **Response**: Array of candidate objects

#### Get Single Candidate
- **Method**: GET
- **Route**: `/candidates/:id`
- **Description**: Retrieve a specific candidate by ID
- **Response**: Single candidate object

#### Create Candidate
- **Method**: POST
- **Route**: `/candidates`
- **Description**: Create a new candidate
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
  ```
- **Response**: Created candidate object

#### Update Candidate
- **Method**: PUT
- **Route**: `/candidates/:id`
- **Description**: Update candidate information
- **Body**: Any candidate fields to update
- **Response**: Updated candidate object

#### Delete Candidate
- **Method**: DELETE
- **Route**: `/candidates/:id`
- **Description**: Delete a candidate
- **Response**: Success message

### Interviews

#### Get All Interviews
- **Method**: GET
- **Route**: `/interviews`
- **Description**: Retrieve all interviews with populated candidate and question data
- **Response**: Array of interview objects

#### Get Single Interview
- **Method**: GET
- **Route**: `/interviews/:id`
- **Description**: Retrieve a specific interview with all related data
- **Response**: Single interview object with populated fields

#### Create Interview
- **Method**: POST
- **Route**: `/interviews`
- **Description**: Create a new interview with questions
- **Body**:
  ```json
  {
    "candidateId": "string",
    "questions": [
      {
        "text": "string",
        "difficulty": "easy|medium|hard",
        "timeLimit": "number"
      }
    ]
  }
  ```
- **Response**: Created interview object

#### Update Interview
- **Method**: PUT
- **Route**: `/interviews/:id`
- **Description**: Update interview status, score, or completion
- **Body**:
  ```json
  {
    "status": "pending|in-progress|completed",
    "score": "number",
    "completedAt": "date"
  }
  ```
- **Response**: Updated interview object

#### Delete Interview
- **Method**: DELETE
- **Route**: `/interviews/:id`
- **Description**: Delete an interview and its associated questions
- **Response**: Success message

### Chat Messages

#### Get Interview Chat Messages
- **Method**: GET
- **Route**: `/chat/interview/:interviewId`
- **Description**: Get all chat messages for a specific interview
- **Response**: Array of chat message objects

#### Create Chat Message
- **Method**: POST
- **Route**: `/chat`
- **Description**: Create a new chat message
- **Body**:
  ```json
  {
    "interviewId": "string",
    "sender": "user|bot",
    "text": "string"
  }
  ```
- **Response**: Created chat message object

#### Delete Chat Message
- **Method**: DELETE
- **Route**: `/chat/:id`
- **Description**: Delete a chat message
- **Response**: Success message

### Resume Management

#### Upload Resume
- **Method**: POST
- **Route**: `/resumes`
- **Description**: Upload a candidate's resume and extract information
- **Body**: multipart/form-data
  ```
  file: (binary)
  candidateId: string
  ```
- **Response**: Created resume object with extracted data

#### Get Candidate Resume
- **Method**: GET
- **Route**: `/resumes/candidate/:candidateId`
- **Description**: Get resume information for a specific candidate
- **Response**: Resume object with file URL and extracted data

#### Delete Resume
- **Method**: DELETE
- **Route**: `/resumes/:id`
- **Description**: Delete a resume
- **Response**: Success message

## Error Responses
All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request body or parameters
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Requested resource not found
- **500 Internal Server Error**: Server-side error

## Response Format
Successful responses will include the requested data. Error responses will have the following format:
```json
{
  "message": "Error description"
}
```