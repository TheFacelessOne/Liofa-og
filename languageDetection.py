from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from lingua import LanguageDetectorBuilder
from dotenv import load_dotenv
import os

load_dotenv()

detector = LanguageDetectorBuilder.from_all_languages().with_preloaded_language_models().build()
app = FastAPI()

class LanguageDetectionRequest(BaseModel):
    text: str

@app.post("/detect-language/")
async def detect_language(request: LanguageDetectionRequest):
    text = request.text
    
    try:
        language = detector.detect_language_of(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"detected_language": language.iso_code_639_1.name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("LANGDETECTORPORT")))