import requests
from bs4 import BeautifulSoup

from app.core.database import SessionLocal
from app.models import ProblemStatement


SIH_URL = "https://www.sih.gov.in/sih2026PS"


def fetch_problem_statements():

    response = requests.get(
        SIH_URL,
        timeout=30,
        headers={
            "User-Agent": (
                "Mozilla/5.0 "
                "(Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/150.0 Safari/537.36"
            )
        }
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    table = soup.find("table")

    if not table:
        raise RuntimeError("Problem statement table not found")

    rows = table.find_all("tr")

    problem_statements = []

    for row in rows:

        cells = row.find_all("td")

        if len(cells) < 7:
            continue

        values = [
            cell.get_text(" ", strip=True)
            for cell in cells
        ]

        problem_statements.append(values)
    print(f"\nRows discovered: {len(problem_statements)}")

    if problem_statements:
        print("\nLAST 5 VALUES OF FIRST ROW:")
        print(problem_statements[0][-5:])
        
    return problem_statements


def save_problem_statements(rows):

    db = SessionLocal()

    inserted = 0
    updated = 0

    try:
        for row in rows:

            if len(row) < 5:
                continue

            category = row[-5]
            ps_number = row[-4]
            idea_data = row[-3]
            theme = row[-2]
            deadline = row[-1]

            if not ps_number.startswith("SIH"):
                continue

            # These correspond to the clean fields
            organization = row[1]
            title = row[5]

            try:
                idea_count, idea_limit = idea_data.split("/")
                idea_count = int(idea_count)
                idea_limit = int(idea_limit)
            except (ValueError, AttributeError):
                idea_count = 0
                idea_limit = 500

            existing = (
                db.query(ProblemStatement)
                .filter(
                    ProblemStatement.ps_number == ps_number
                )
                .first()
            )

            if existing:

                existing.organization = organization
                existing.title = title
                existing.category = category
                existing.idea_count = idea_count
                existing.idea_limit = idea_limit
                existing.theme = theme
                existing.deadline = deadline

                updated += 1

            else:

                problem = ProblemStatement(
                    ps_number=ps_number,
                    organization=organization,
                    title=title,
                    category=category,
                    idea_count=idea_count,
                    idea_limit=idea_limit,
                    theme=theme,
                    deadline=deadline
                )

                db.add(problem)

                inserted += 1

        db.commit()

        print(f"Inserted: {inserted}")
        print(f"Updated: {updated}")

    finally:
        db.close()


if __name__ == "__main__":

    rows = fetch_problem_statements()

    print(f"Rows discovered: {len(rows)}")

    save_problem_statements(rows)