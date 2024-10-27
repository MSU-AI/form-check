from typing import Annotated, Optional
from fastapi import Depends, FastAPI, Query, status, HTTPException
from dotenv import load_dotenv, dotenv_values
import firebase_admin
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth, storage, credentials
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

app = FastAPI()
config = {
    **dotenv_values(".env"), 
}

origins = [config["FRONTEND_URL"]] # temporarily allowing everything
print(origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load_dotenv()
cred = credentials.Certificate('./service-account.json')
default_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'form-checker-7535c.appspot.com'
})

bucket = storage.bucket()


# https://medium.com/@gabriel.cournelle/firebase-authentication-in-the-backend-with-fastapi-4ff3d5db55ca

# use of a simple bearer scheme as auth is handled by firebase and not fastapi
# we set auto_error to False because fastapi incorrectly returns a 403 intead 
# of a 401
# see: https://github.com/tiangolo/fastapi/pull/2120
bearer_scheme = HTTPBearer(auto_error=False)

# https://medium.com/@gabriel.cournelle/firebase-authentication-in-the-backend-with-fastapi-4ff3d5db55ca
def get_firebase_user_from_token(
    token: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
) -> Optional[dict]:
    """Uses bearer token to identify firebase user id

    Args:
        token : the bearer token. Can be None as we set auto_error to False

    Returns:
        dict: the firebase user on success
    Raises:
        HTTPException 401 if user does not exist or token is invalid
    """
    try:
        if not token:
            # raise and catch to return 401, only needed because fastapi returns 403
            # by default instead of 401 so we set auto_error to False
            raise ValueError("No token")
        user = auth.verify_id_token(token.credentials)
        return user

    # lots of possible exceptions, see firebase_admin.auth,
    # but most of the time it is a credentials issue
    except Exception:
        # see https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in or Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/process_video")
async def process_video(user: Annotated[dict, Depends(get_firebase_user_from_token)],
                        videoName: Annotated[str,Query()]):
    # print(user['uid'])

    blob = bucket.blob(f"videos/{user['uid']}/{videoName}") #.upload_from_string("dummy")
    print(blob.public_url)
    print(blob.size)
    print(user['uid'])
    try:
        blob.download_to_filename(videoName)
    except Exception as e:
        try: # added in case the file was not found
            os.remove(videoName)
        except:
            pass
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video not found on the account for this user",
            headers={"WWW-Authenticate": "Bearer"}
        )
    print(os.path.getsize(videoName))
    videoSize = os.path.getsize(videoName)
    os.remove(videoName)
    return {"Stuff": "Video processing started",
            "videoSize": videoSize}
    # send bearer and name to firebase
