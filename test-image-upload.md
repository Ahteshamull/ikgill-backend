# Test Image Upload for Messages

## API Endpoints Added

### POST /api/v1/message/new-message

- **Authentication**: Required (userAuthMiddleware)
- **Upload**: Supports up to 5 images via `images` field
- **Body**:
  ```json
  {
    "text": "Message text",
    "receiverId": "user_id",
    "eventId": "event_id" // optional
  }
  ```

### POST /api/v1/message/single-message

- **Authentication**: Required (userAuthMiddleware)
- **Upload**: Supports up to 5 images via `images` field
- **Body**:
  ```json
  {
    "text": "Message text",
    "receiverId": "user_id"
  }
  ```

## How to Test

### Using FormData (JavaScript/React)

```javascript
const formData = new FormData();
formData.append("text", "Hello with images!");
formData.append("receiverId", "USER_ID_HERE");
formData.append("images", file1); // File object
formData.append("images", file2); // Another file

fetch("/api/v1/message/new-message", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
  body: formData,
});
```

### Using curl

```bash
curl -X POST http://localhost:3000/api/v1/message/new-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "text=Hello with image" \
  -F "receiverId=USER_ID_HERE" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Changes Made

1. **Routes**: Added file upload middleware to message endpoints
2. **Service**: Updated to handle uploaded files and generate URLs
3. **Controller**: Pass uploaded files to service layer

## Environment Variable

Make sure `IMAGE_URL` is set in your .env file:

```
IMAGE_URL=http://localhost:3000/uploads/
```

If not set, the system will use empty string and images will be stored with just filename.
