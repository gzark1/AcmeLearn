"""
Generate tag categories systematically using LLM.

This script:
1. Reads all tags from courses.json
2. Uses an LLM to categorize each tag programmatically
3. Outputs to config/tag_categories.json (reviewable, version-controlled)

Categories: Programming, Business, Design, Data Science, DevOps, Marketing, Soft Skills, Creative, Other
"""

import json
import os
from pathlib import Path
from typing import Dict, Set

# Define the project root (parent of backend/)
PROJECT_ROOT = Path(__file__).parent.parent.parent
COURSES_JSON_PATH = PROJECT_ROOT / "courses.json"
CONFIG_DIR = PROJECT_ROOT / "backend" / "config"
OUTPUT_PATH = CONFIG_DIR / "tag_categories.json"


def extract_unique_tags() -> Set[str]:
    """Extract all unique tags from courses.json."""
    with open(COURSES_JSON_PATH, "r") as f:
        courses = json.load(f)

    tags = set()
    for course in courses:
        tags.update(course.get("tags", []))

    return tags


def categorize_tags_with_llm(tags: Set[str]) -> Dict[str, str]:
    """
    Systematically categorize tags using rule-based logic.

    Categories:
    - Programming: Languages, frameworks, web dev tools
    - Data Science: Analytics, ML, AI, statistics
    - DevOps: Infrastructure, cloud, deployment
    - Business: Business ops, finance, strategy
    - Marketing: Digital marketing, SEO, social media
    - Design: UI/UX, graphic design, visual tools
    - Soft Skills: Leadership, communication, teamwork
    - HR & Talent: Recruiting, culture, employee experience
    - Security: Cybersecurity, compliance, privacy
    - Other: General or uncategorized
    """

    # Define category mappings based on keywords (order matters - more specific first)
    category_rules = {
        "Security": [
            "cybersecurity", "security", "ethical hacking", "privacy", "gdpr",
            "compliance", "risk management", "data protection"
        ],
        "HR & Talent": [
            "hr", "human resources", "recruitment", "talent acquisition", "talent management",
            "employer branding", "employee engagement", "employee experience",
            "diversity", "inclusion", "equity", "dei", "culture", "onboarding",
            "retention", "compensation", "benefits", "performance management",
            "workforce planning", "talent", "hiring"
        ],
        "Programming": [
            "python", "javascript", "java", "c++", "ruby", "php", "swift", "kotlin",
            "programming", "coding", "web development", "backend", "frontend", "fullstack",
            "react", "angular", "vue", "node.js", "django", "flask", "spring",
            "api", "rest", "graphql", "sql", "nosql", "mongodb", "postgresql",
            "html", "css", "typescript", "go", "rust", "scala", "technical",
            "algorithms", "data structures", "fundamentals", "es6", "database",
            "computer science", "architecture", "software"
        ],
        "Data Science": [
            "data science", "machine learning", "deep learning", "ai", "artificial intelligence",
            "analytics", "data analysis", "statistics", "data visualization",
            "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
            "big data", "data engineering", "neural networks", "nlp", "computer vision",
            "keras", "data literacy", "business intelligence", "visualization",
            "blockchain", "cryptocurrency"
        ],
        "DevOps": [
            "devops", "docker", "kubernetes", "ci/cd", "jenkins", "aws", "azure", "gcp",
            "cloud computing", "infrastructure", "deployment", "automation",
            "terraform", "ansible", "linux", "bash", "shell scripting",
            "monitoring", "microservices", "containers", "cloud", "cloud-native",
            "serverless", "orchestration"
        ],
        "Business": [
            "business", "management", "strategy", "operations", "finance",
            "accounting", "economics", "entrepreneurship", "startup",
            "product management", "project management", "agile", "scrum",
            "sales", "negotiation", "budgeting", "contracts", "legal",
            "innovation", "change management", "crisis management", "decision making",
            "lean", "six sigma", "kpi", "roi", "executive", "enterprise"
        ],
        "Marketing": [
            "marketing", "digital marketing", "seo", "sem", "social media",
            "content marketing", "email marketing", "advertising", "branding",
            "copywriting", "google analytics", "facebook ads",
            "influencer marketing", "growth hacking", "personal branding",
            "online marketing", "crm", "customer", "cx", "conversion",
            "ecommerce", "customer experience", "customer service", "customer relations"
        ],
        "Design": [
            "design", "ui", "ux", "user interface", "user experience",
            "graphic design", "web design", "figma", "sketch", "adobe",
            "photoshop", "illustrator", "prototyping", "wireframing",
            "design thinking", "visual design", "interaction design",
            "service design", "product design"
        ],
        "Soft Skills": [
            "soft skills", "leadership", "communication", "teamwork", "team building",
            "emotional intelligence", "public speaking", "presentation", "networking",
            "time management", "productivity", "career development", "professional development",
            "conflict resolution", "problem solving", "critical thinking", "creativity",
            "coaching", "mentoring", "feedback", "influence", "executive presence",
            "wellness", "health", "stress management", "work-life", "personal growth",
            "interview prep", "career", "job search"
        ],
        "Sustainability": [
            "sustainability", "esg", "environment", "green", "climate",
            "csr", "social responsibility", "ethics", "impact"
        ]
    }

    tag_categories = {}

    for tag in tags:
        tag_lower = tag.lower()
        category_found = False

        # Check against each category's keywords
        for category, keywords in category_rules.items():
            for keyword in keywords:
                if keyword in tag_lower or tag_lower in keyword:
                    tag_categories[tag] = category
                    category_found = True
                    break
            if category_found:
                break

        # Default to "Other" if no match found
        if not category_found:
            tag_categories[tag] = "Other"

    return tag_categories


def save_categories(tag_categories: Dict[str, str]) -> None:
    """Save tag categories to JSON file."""
    # Create config directory if it doesn't exist
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    # Sort by category, then by tag name for better readability
    sorted_tags = sorted(tag_categories.items(), key=lambda x: (x[1], x[0]))
    sorted_dict = dict(sorted_tags)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(sorted_dict, f, indent=2)

    print(f"✅ Generated {len(tag_categories)} tag categories")
    print(f"📁 Saved to: {OUTPUT_PATH}")

    # Print summary by category
    category_counts = {}
    for tag, category in tag_categories.items():
        category_counts[category] = category_counts.get(category, 0) + 1

    print("\n📊 Category Distribution:")
    for category, count in sorted(category_counts.items()):
        print(f"  {category}: {count} tags")


def main():
    """Main execution function."""
    print("🏷️  Extracting tags from courses.json...")
    tags = extract_unique_tags()
    print(f"✅ Found {len(tags)} unique tags")

    print("\n🤖 Categorizing tags...")
    tag_categories = categorize_tags_with_llm(tags)

    print("\n💾 Saving categories...")
    save_categories(tag_categories)

    print("\n✨ Done! Tag categories generated successfully.")
    print(f"📝 Review the file: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
