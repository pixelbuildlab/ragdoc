from typing import Optional
import logging
from trafilatura import extract
from trafilatura.downloads import fetch_url

logger = logging.getLogger(__name__)


class LiveFeedService:
    def __init__(self):
        pass

    def feed_url(self, url: str) -> Optional[str]:
        """
        Fetch and extract the main content from a webpage.

        Args:
            url: URL of the webpage.

        Returns:
            Extracted text if successful, otherwise None.
        """
        if not url:
            raise ValueError("URL cannot be empty.")

        downloaded = fetch_url(url)

        if downloaded is None:
            return None

        logger.info(msg=downloaded)
        extracted_data = extract(
            downloaded,
            include_comments=False,
            include_tables=True,
        )

        return extracted_data
