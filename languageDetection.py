from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from lingua import LanguageDetectorBuilder, IsoCode639_3
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
        condifenceReport = detector.compute_language_confidence_values(text)
        response = condifenceReport.pop(0)
        detected = response.language.iso_code_639_1.name
        

        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"detected_language" : detected, "confidence" : response.value}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("LANGDETECTORPORT")))