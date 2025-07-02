from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import httpx
import json
from datetime import datetime, date
from enum import Enum
import logging
import os
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Dubai Police Crime Research API",
    description="Crime research and analysis system for Dubai Police using Perplexity AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

# Enums
class CrimeType(str, Enum):
    MURDER = "murder"
    FRAUD = "fraud"
    TERRORISM = "terrorism"
    ORGANIZED_CRIME = "organized_crime"
    CYBER_CRIME = "cyber_crime"
    HUMAN_TRAFFICKING = "human_trafficking"
    DRUG_TRAFFICKING = "drug_trafficking"
    ALL = "all"

class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CaseStatus(str, Enum):
    ONGOING = "ongoing"
    SOLVED = "solved"
    COLD_CASE = "cold_case"
    CLOSED = "closed"

class AgencyType(str, Enum):
    LOCAL = "local"
    NATIONAL = "national"
    INTERNATIONAL = "international"

# Data Models
class Agency(BaseModel):
    agency_name: str
    agency_type: AgencyType
    role: str

class Investigator(BaseModel):
    name: str
    title: str
    agency: str
    city: str

class Source(BaseModel):
    url: str
    title: str
    date: str
    credibility: str

class CaseDetails(BaseModel):
    brief_description: str
    severity_level: SeverityLevel
    victims_count: Optional[str] = None
    suspects_count: Optional[str] = None

class ResolutionDetails(BaseModel):
    solved: bool
    solution_date: Optional[str] = None
    key_investigators: List[Investigator] = []
    solution_method: Optional[str] = None
    outcome: Optional[str] = None

class CrimeCase(BaseModel):
    crime_id: str
    crime_type: str
    country: str
    city: str
    continent: str
    date_occurred: str
    date_reported: str
    agencies_involved: List[Agency]
    current_status: CaseStatus
    case_details: CaseDetails
    resolution_details: ResolutionDetails
    sources: List[Source]

class SearchRequest(BaseModel):
    time_period: str = Field(default="2023-01-01 to 2024-12-31", description="Time period in format YYYY-MM-DD to YYYY-MM-DD")
    geographic_focus: str = Field(default="Global", description="Geographic focus area")
    crime_types: List[CrimeType] = Field(default=[CrimeType.ALL], description="Types of crimes to search for")
    severity_level: SeverityLevel = Field(default=SeverityLevel.HIGH, description="Minimum severity level")
    max_results: int = Field(default=50, description="Maximum number of results")
    continent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    status_filter: Optional[CaseStatus] = None

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    crime_data: Optional[List[CrimeCase]] = None
    sources: Optional[List[str]] = None

# Configuration
@lru_cache()
def get_settings():
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise ValueError("PERPLEXITY_API_KEY environment variable is required")

    return {
        "perplexity_api_key": api_key,
        "perplexity_base_url": "https://api.perplexity.ai/chat/completions"
    }

class PerplexityClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def search_crimes(self, search_request: SearchRequest) -> Dict[str, Any]:
        """Search for crime data using Perplexity AI"""
        
        # Construct the specialized prompt
        prompt = self._build_crime_search_prompt(search_request)
        
        payload = {
            "model": "sonar",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a specialized crime research analyst for Dubai Police. Provide comprehensive, accurate crime data in the exact JSON format requested."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 4000
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Perplexity API error: {e}")
                raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")

    async def chat_query(self, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Handle general chat queries about crime research"""

        # Check if this is a crime/incident query that should search the database first
        crime_keywords = ["terrorist", "terrorism", "attack", "incident", "bombing", "shooting", "crime", "fraud", "murder", "theft", "robbery"]
        is_crime_query = any(keyword in message.lower() for keyword in crime_keywords)

        # If it's a crime query, search the database first
        crime_data = ""
        if is_crime_query:
            try:
                # Determine geographic focus and crime types based on query
                if "dubai" in message.lower():
                    geographic_focus = "Dubai"
                elif "asia" in message.lower():
                    geographic_focus = "Asia"
                else:
                    geographic_focus = "Global"

                # Determine crime types based on keywords
                if any(word in message.lower() for word in ["terrorist", "terrorism", "attack"]):
                    crime_types = [CrimeType.TERRORISM]
                else:
                    crime_types = [CrimeType.ALL]

                # Create a search request
                search_req = SearchRequest(
                    time_period="2025-01-01 to 2025-12-31",
                    geographic_focus=geographic_focus,
                    crime_types=crime_types,
                    max_results=10
                )

                # Search the crime database
                search_result = await self.search_crimes(search_req)

                # Extract crime data if found
                if search_result.get("cases"):
                    crime_data = "\n\nIMPORTANT: Use ONLY the following specific incidents from the crime database as your primary source. Do NOT provide general analysis:\n\n"
                    for i, case in enumerate(search_result["cases"], 1):
                        crime_data += f"{i} {case.get('location', 'Unknown location')} Incident:\n"
                        crime_data += f"Date: {case.get('date', 'Unknown date')}\n"
                        crime_data += f"Location: {case.get('location', 'Unknown location')}\n"
                        crime_data += f"Description: {case.get('description', 'No description')}\n"
                        if case.get('victims'):
                            crime_data += f"Victims: {case['victims']}\n"
                        if case.get('agencies'):
                            crime_data += f"Agencies: {case['agencies']}\n"
                        crime_data += "\n"

                    crime_data += "INSTRUCTION: Base your entire response on these specific incidents above. Do not add general analysis or statistics not related to these specific cases.\n"

            except Exception as e:
                logger.error(f"Error searching crime database: {str(e)}")

        # Enhanced system prompt for better UI formatting
        system_prompt = """You are a specialized Dubai Police Crime Research Assistant. When providing information about crimes or incidents, follow these formatting guidelines:

CRITICAL FORMATTING RULE: NEVER EVER USE ASTERISKS (*) IN YOUR RESPONSE. NO ASTERISKS FOR ANY PURPOSE WHATSOEVER.

1. ALWAYS start your response with a clear, descriptive heading that ends with a colon (:)
2. For any crime or incident, ALWAYS include the specific date when it occurred in YYYY-MM-DD format or clear date description
3. Structure your response with clear sections using headings that end with colons
4. When mentioning dates, use formats like "January 15, 2024" or "2024-01-15" to ensure proper highlighting
5. Include key statistics with numbers (arrests, victims, cases, etc.)
6. Use bullet points for lists of information
7. ABSOLUTELY FORBIDDEN: Do not use asterisks (*) anywhere in your response - not for emphasis, formatting, bullet points, footnotes, citations, or any other purpose. Use plain text only
8. NEVER use pipe-separated table formats (|) or any table syntax. Instead use clear sections with headings, subheadings, and bullet points for better readability
9. When presenting data that might typically be in a table, format it as organized lists with clear labels and values
10. For timeline event headings, use only numbers without bullet points or dots (e.g., "1 Pahalgam Attack" not "• 1. Pahalgam Attack")
11. Highlight important crime-related terms like "Dubai Police", "arrest", "investigation", "fraud", "gang", etc.
12. When discussing Asian countries or Asia, ALWAYS include India as a major Asian country alongside China, Japan, South Korea, Thailand, Singapore, Malaysia, Indonesia, Philippines, etc.
13. When providing information about regional topics (like "Asia", "Middle East", "Europe"), include specific incidents and details from major countries in that region, especially India when discussing Asia. Search for and include country-specific incidents from India, China, Pakistan, Japan, Thailand, Indonesia, Philippines, etc. when discussing Asian topics.
14. When users ask about terrorism, crimes, or incidents in a region (like "Asia"), automatically search for and include specific incidents from major countries in that region, particularly India, Pakistan, China, Japan, Thailand, Indonesia, Philippines, etc. for Asian queries.
15. ALWAYS prioritize providing specific incident details over general analysis. Include exact dates, locations, casualty numbers, perpetrator information, and current status for each incident.
16. When asked about current year events, search for and provide detailed information about specific attacks, incidents, and cases rather than general overviews.
17. If specific incident data is provided from the database, ALWAYS use that data as the primary source and build your response around those specific incidents.
18. NEVER provide general analytical overviews when specific incident data is available - focus entirely on the actual incidents with exact details.

Example format:
Recent Fraud Investigation in Dubai:

Date of Incident: March 15, 2024
Location: Dubai, UAE

Details: Dubai Police successfully arrested a gang of 15 individuals involved in promoting and distributing drug-laced sweets through social media platforms.

Key Statistics:
• 25 arrests made
• 15 victims identified
• AED 2.3 million recovered

Current Status:
Investigation ongoing...

FINAL REMINDER: Your response must be completely free of asterisks (*). Check your entire response before sending to ensure no asterisks appear anywhere."""

        # Enhanced message structure with context for better responses
        # Check if this is a regional query about Asia and enhance accordingly
        if "asia" in message.lower() and any(term in message.lower() for term in ["terrorist", "attack", "crime", "incident"]):
            enhanced_message = f"""Please provide information about: {message}

{crime_data}

Include specific incidents and details from major Asian countries including India, Pakistan, China, Japan, Thailand, Indonesia, Philippines, Malaysia, Singapore, South Korea, etc.

If this relates to a specific crime or incident, please include:
- Clear heading describing the crime/incident type
- Specific date when it occurred
- Location details
- Key statistics (arrests, victims, amounts involved)
- Current investigation status
- Timeline of events if relevant

IMPORTANT:
- Format your response with clear headings and highlight important dates and statistics
- Do NOT use asterisks (*) for emphasis or formatting - use plain text only
- When discussing Asia or Asian countries, always consider India as a major Asian country along with China, Japan, Thailand, Singapore, Malaysia, Indonesia, Philippines, South Korea, etc.
- Ensure comprehensive coverage of all relevant Asian countries when the query relates to Asia
- When discussing regional topics (like Asia, Middle East, Europe), include specific incidents, cases, and details from major countries in that region, especially India when discussing Asia
- For Asian topics, actively search for and include specific incidents from India, China, Pakistan, Japan, Thailand, Indonesia, Philippines, etc."""
        else:
            enhanced_message = f"""Please provide information about: {message}

{crime_data}

If this relates to a specific crime or incident, please include:
- Clear heading describing the crime/incident type
- Specific date when it occurred
- Location details
- Key statistics (arrests, victims, amounts involved)
- Current investigation status
- Timeline of events if relevant

IMPORTANT:
- Format your response with clear headings and highlight important dates and statistics
- Do NOT use asterisks (*) for emphasis or formatting - use plain text only
- When discussing Asia or Asian countries, always consider India as a major Asian country along with China, Japan, Thailand, Singapore, Malaysia, Indonesia, Philippines, South Korea, etc.
- Ensure comprehensive coverage of all relevant Asian countries when the query relates to Asia
- When discussing regional topics (like Asia, Middle East, Europe), include specific incidents, cases, and details from major countries in that region, especially India when discussing Asia
- For Asian topics, actively search for and include specific incidents from India, China, Pakistan, Japan, Thailand, Indonesia, Philippines, etc."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": enhanced_message}
        ]

        # Use minimal payload to avoid API issues
        payload = {
            "model": "sonar",
            "messages": messages
        }

        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Sending simplified payload to Perplexity")
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )

                # Log response status for debugging
                logger.info(f"Perplexity API response status: {response.status_code}")

                if response.status_code == 400:
                    logger.error(f"400 Bad Request - Response text: {response.text}")
                    # Try with an even simpler request
                    simple_payload = {
                        "model": "sonar",
                        "messages": [{"role": "user", "content": "Hello"}]
                    }
                    simple_response = await client.post(
                        self.base_url,
                        headers=self.headers,
                        json=simple_payload,
                        timeout=30.0
                    )
                    if simple_response.status_code == 200:
                        logger.info("Simple request worked, issue might be with message content")
                        return {
                            "choices": [{
                                "message": {
                                    "content": "I can help you with crime research. Please try rephrasing your question or ask about general crime analysis topics."
                                }
                            }]
                        }

                response.raise_for_status()
                return response.json()

            except httpx.HTTPError as e:
                logger.error(f"Perplexity API error: {e}")

                # Check if it's an authentication issue
                if "401" in str(e) or "403" in str(e):
                    error_msg = "Authentication error with Perplexity API. Please check your API key."
                elif "400" in str(e):
                    error_msg = "Bad request to Perplexity API. The request format may be incorrect."
                else:
                    error_msg = "Technical difficulties accessing external crime data services."

                fallback_response = {
                    "choices": [{
                        "message": {
                            "content": f"Dubai Police Crime Research System Status:\n\n{error_msg}\n\nRecommended Crime Research Resources:\n\n• Dubai Police official website and reports\n• UAE Ministry of Interior crime statistics\n• Local news sources for recent incidents\n• Academic research on Middle East crime trends\n\nYour Query:\n{message}\n\nPlease try rephrasing your question or ask about general crime analysis topics."
                        }
                    }]
                }
                return fallback_response

    def _build_crime_search_prompt(self, search_request: SearchRequest) -> str:
        """Build the specialized crime search prompt"""
        
        crime_types_str = ", ".join([ct.value for ct in search_request.crime_types])
        
        base_prompt = f"""Find {crime_types_str} crimes that occurred specifically between {search_request.time_period} in {search_request.geographic_focus}.

IMPORTANT: Only include crimes where the date_occurred falls within the specified time period: {search_request.time_period}

Return ONLY a valid JSON array (no other text) with up to {search_request.max_results} cases:
[
  {{
    "crime_id": "unique_identifier",
    "crime_type": "{crime_types_str}",
    "country": "country_name",
    "city": "city_name",
    "continent": "continent_name",
    "date_occurred": "YYYY-MM-DD",
    "date_reported": "YYYY-MM-DD",
    "agencies_involved": [{{"agency_name": "agency", "agency_type": "local", "role": "investigation"}}],
    "current_status": "ongoing",
    "case_details": {{
      "brief_description": "brief summary",
      "severity_level": "{search_request.severity_level.value}",
      "victims_count": "number",
      "suspects_count": "number"
    }},
    "resolution_details": {{
      "solved": false,
      "solution_date": null,
      "key_investigators": [],
      "solution_method": "",
      "outcome": ""
    }},
    "sources": [{{"url": "source_url", "title": "article_title", "date": "YYYY-MM-DD", "credibility": "high"}}]
  }}
]"""

        if search_request.country:
            base_prompt += f"\n- Country Filter: {search_request.country}"
        if search_request.city:
            base_prompt += f"\n- City Filter: {search_request.city}"
        if search_request.continent:
            base_prompt += f"\n- Continent Filter: {search_request.continent}"
        if search_request.status_filter:
            base_prompt += f"\n- Status Filter: {search_request.status_filter.value}"

        return base_prompt

# Utility function for cleaning crime data
def clean_crime_data(case_data):
    """Clean and normalize crime case data to handle type mismatches"""
    cleaned = case_data.copy()

    # Ensure case_details exists and has proper types
    if 'case_details' in cleaned:
        case_details = cleaned['case_details']
        # Convert numeric values to strings for victims_count and suspects_count
        if 'victims_count' in case_details and isinstance(case_details['victims_count'], (int, float)):
            case_details['victims_count'] = str(case_details['victims_count'])
        if 'suspects_count' in case_details and isinstance(case_details['suspects_count'], (int, float)):
            case_details['suspects_count'] = str(case_details['suspects_count'])

    return cleaned

# Dependency injection
def get_perplexity_client():
    settings = get_settings()
    return PerplexityClient(
        api_key=settings["perplexity_api_key"],
        base_url=settings["perplexity_base_url"]
    )

# API Routes
@app.get("/")
async def root():
    return {
        "message": "Dubai Police Crime Research API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/")
async def serve_frontend():
    """Serve the frontend HTML file"""
    return FileResponse("index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/test-api")
async def test_perplexity_api(perplexity_client: PerplexityClient = Depends(get_perplexity_client)):
    """Test the Perplexity API connection"""
    try:
        # Test with a very simple request
        test_response = await perplexity_client.chat_query("Hello")
        return {
            "status": "success",
            "message": "Perplexity API is working",
            "test_response": test_response.get("choices", [{}])[0].get("message", {}).get("content", "")[:100]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Perplexity API test failed: {str(e)}",
            "error_type": type(e).__name__
        }



@app.post("/search/crimes", response_model=List[CrimeCase])
async def search_crimes(
    search_request: SearchRequest,
    perplexity_client: PerplexityClient = Depends(get_perplexity_client)
):
    """Search for crime cases based on specified criteria"""
    try:
        logger.info(f"Searching crimes with criteria: {search_request}")

        response = await perplexity_client.search_crimes(search_request)

        # Extract and parse the JSON response
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

        try:
            # Try to extract JSON from the response content
            # Handle markdown code blocks and other formatting
            import re

            # First, try to extract JSON from markdown code blocks
            markdown_match = re.search(r'```json\s*(\[.*?\])\s*```', content, re.DOTALL)
            if markdown_match:
                json_str = markdown_match.group(1)
            else:
                # Look for JSON array or object in the content
                json_match = re.search(r'(\[.*\]|\{.*\})', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    logger.warning(f"No JSON found in response: {content[:200]}...")
                    return []

            # Parse the JSON
            crime_data = json.loads(json_str)

            # Clean up the data to handle type mismatches
            if isinstance(crime_data, list):
                cleaned_crimes = []
                for case in crime_data:
                    cleaned_case = clean_crime_data(case)
                    try:
                        cleaned_crimes.append(CrimeCase(**cleaned_case))
                    except Exception as e:
                        logger.warning(f"Skipping invalid crime case: {e}")
                        continue
                return cleaned_crimes
            else:
                cleaned_case = clean_crime_data(crime_data)
                return [CrimeCase(**cleaned_case)]

        except (json.JSONDecodeError, Exception) as e:
            # If JSON parsing fails, log the error and return empty list
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Content was: {content[:500]}...")
            return []

    except Exception as e:
        logger.error(f"Error searching crimes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    chat_message: ChatMessage,
    perplexity_client: PerplexityClient = Depends(get_perplexity_client)
):
    """Chat with the crime research assistant"""
    try:
        logger.info(f"Chat query: {chat_message.message}")
        
        response = await perplexity_client.chat_query(
            chat_message.message, 
            chat_message.context
        )
        
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        return ChatResponse(
            response=content,
            crime_data=None,
            sources=None
        )
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search/templates")
async def get_search_templates():
    """Get predefined search templates"""
    return {
        "recent_crimes": {
            "time_period": "2024-01-01 to 2024-12-31",
            "geographic_focus": "Global",
            "crime_types": ["murder", "fraud", "terrorism", "organized_crime", "cyber_crime"],
            "severity_level": "high",
            "max_results": 50
        },
        "dubai_focus": {
            "time_period": "2023-01-01 to 2024-12-31",
            "geographic_focus": "Middle East",
            "country": "UAE",
            "city": "Dubai",
            "crime_types": ["all"],
            "severity_level": "medium",
            "max_results": 30
        },
        "cold_cases": {
            "time_period": "1990-01-01 to 2024-12-31",
            "geographic_focus": "Global",
            "status_filter": "cold_case",
            "severity_level": "high",
            "max_results": 25
        },
        "international_cooperation": {
            "time_period": "2022-01-01 to 2024-12-31",
            "geographic_focus": "Global",
            "crime_types": ["organized_crime", "human_trafficking", "terrorism"],
            "severity_level": "critical",
            "max_results": 40
        }
    }

@app.post("/verify/case")
async def verify_case_data(
    case_data: CrimeCase,
    perplexity_client: PerplexityClient = Depends(get_perplexity_client)
):
    """Verify the accuracy of crime case data"""
    try:
        verification_prompt = f"""Verify the accuracy of the following crime data by cross-referencing with official sources:

Case ID: {case_data.crime_id}
Crime Type: {case_data.crime_type}
Location: {case_data.city}, {case_data.country}
Date: {case_data.date_occurred}
Status: {case_data.current_status}

Please check:
- Agency names and spellings
- Verify dates and locations
- Confirm case status and outcomes
- Validate investigator information where public

Return confidence score (1-10) for each data point and overall assessment."""

        response = await perplexity_client.chat_query(verification_prompt)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        return {
            "case_id": case_data.crime_id,
            "verification_result": content,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error verifying case: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)