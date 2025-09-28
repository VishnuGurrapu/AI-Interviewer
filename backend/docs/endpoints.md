# API Endpoints Testing Guide

Base URL: `http://localhost:3000/api`

## Candidates

### 1. Get All Candidates
```bash
curl -X GET http://localhost:3000/api/candidates \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Single Candidate
```bash
curl -X GET http://localhost:3000/api/candidates/CANDIDATE_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create Candidate
```bash
curl -X POST http://localhost:3000/api/candidates \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}'
```

### 4. Update Candidate
```bash
curl -X PUT http://localhost:3000/api/candidates/CANDIDATE_ID \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "status": "in-progress",
  "score": 85,
  "aiSummary": "Strong candidate with excellent communication skills"
}'
```

### 5. Delete Candidate
```bash
curl -X DELETE http://localhost:3000/api/candidates/CANDIDATE_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Interviews

### 1. Get All Interviews
```bash
curl -X GET http://localhost:3000/api/interviews \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Single Interview
```bash
curl -X GET http://localhost:3000/api/interviews/INTERVIEW_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create Interview
```bash
curl -X POST http://localhost:3000/api/interviews \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "candidateId": "CANDIDATE_ID",
  "questions": [
    {
      "text": "What is your experience with React?",
      "difficulty": "medium",
      "timeLimit": 300
    },
    {
      "text": "Explain REST API principles",
      "difficulty": "hard",
      "timeLimit": 420
    }
  ]
}'
```

### 4. Update Interview
```bash
curl -X PUT http://localhost:3000/api/interviews/INTERVIEW_ID \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "status": "completed",
  "score": 92,
  "completedAt": "2025-09-28T15:00:00Z"
}'
```

### 5. Delete Interview
```bash
curl -X DELETE http://localhost:3000/api/interviews/INTERVIEW_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Chat Messages

### 1. Get Interview Chat Messages
```bash
curl -X GET http://localhost:3000/api/chat/interview/INTERVIEW_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create Chat Message
```bash
curl -X POST http://localhost:3000/api/chat \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "interviewId": "INTERVIEW_ID",
  "sender": "user",
  "text": "Could you explain more about the position?"
}'
```

### 3. Delete Chat Message
```bash
curl -X DELETE http://localhost:3000/api/chat/MESSAGE_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Resume Management

### 1. Upload Resume
```bash
curl -X POST http://localhost:3000/api/resumes \
-H "Authorization: Bearer YOUR_TOKEN" \
-F "file=@/path/to/resume.pdf" \
-F "candidateId=CANDIDATE_ID"
```

### 2. Get Candidate Resume
```bash
curl -X GET http://localhost:3000/api/resumes/candidate/CANDIDATE_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Delete Resume
```bash
curl -X DELETE http://localhost:3000/api/resumes/RESUME_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Testing with Environment Variables
You can set up environment variables to make testing easier:

```bash
# Set up environment variables
export API_URL="http://localhost:3000/api"
export AUTH_TOKEN="your-auth-token"
export TEST_CANDIDATE_ID="candidate-id"
export TEST_INTERVIEW_ID="interview-id"

# Example usage with variables
curl -X GET $API_URL/candidates \
-H "Authorization: Bearer $AUTH_TOKEN"
```

## Expected Responses

### Success Response Format
```json
{
  "data": {
    // Requested data
  },
  "message": "Operation successful"
}
```

### Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Common HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Testing Sequence
For a complete test flow:

1. Create a candidate
2. Upload their resume
3. Create an interview
4. Add chat messages
5. Update interview status
6. Check final score
7. Clean up (delete) if needed

Example test sequence:
```bash
# 1. Create candidate and save ID
CANDIDATE_ID=$(curl -X POST $API_URL/candidates \
-H "Authorization: Bearer $AUTH_TOKEN" \
-H "Content-Type: application/json" \
-d '{"name": "Test Candidate", "email": "test@example.com", "phone": "+1234567890"}' \
| jq -r '.data._id')

# 2. Create interview
INTERVIEW_ID=$(curl -X POST $API_URL/interviews \
-H "Authorization: Bearer $AUTH_TOKEN" \
-H "Content-Type: application/json" \
-d "{\"candidateId\": \"$CANDIDATE_ID\", \"questions\": [{\"text\": \"Test question\", \"difficulty\": \"medium\", \"timeLimit\": 300}]}" \
| jq -r '.data._id')

# Continue with other operations...
```