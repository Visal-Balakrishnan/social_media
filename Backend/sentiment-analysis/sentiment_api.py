from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification

# Load model and tokenizer
MODEL_PATH = "bert_sentiment.pth"
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
model.eval()

app = FastAPI()

class CommentRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_sentiment(request: CommentRequest):
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()

    sentiment = "positive" if prediction == 1 else "negative"
    return {"sentiment": sentiment}
