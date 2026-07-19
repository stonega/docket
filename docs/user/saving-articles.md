# Saving and Reading Articles

## Save an article

1. Sign in to the Docket extension.
2. Open a supported HTTPS article or documentation page.
3. Right-click and choose **Save article to Docket**.
4. Keep the page open while Docket extracts and validates the rendered article.

The toast reports whether the article was created, saved as a new version, or already up to date. Extraction, validation, authentication, and storage failures have separate messages.

The extension extracts locally. It sends the cleaned article body and metadata to your private Docket account only after you choose the article command.

## Browse and search

Open **Home → Articles** to browse saved copies. Article cards show the source, cover when available, word count, version count, excerpt count, and last save activity. Site pages include articles associated with that source.

Library search blends current articles and excerpts. Article matches open the Docket reader; the separate original-source action opens the publisher page.

## Read history

The Docket reader shows the current snapshot by default. Use the version dropdown in the header bar to read an immutable historical copy. A historical banner makes that state explicit and provides a return-to-current action.

Restoring a historical snapshot creates a new current version. It does not overwrite or remove any earlier version.

Saved text remains available even when publisher-hosted images, audio, or video fail. Media is loaded lazily from its HTTPS source without a referrer and is not guaranteed to be available offline.

## Excerpts and deletion

Excerpts saved from matching source or canonical URLs are linked automatically, regardless of whether the excerpt or article was saved first. Linked excerpt cards open the Docket reader and retain a separate original-source action.

Deleting an article requires confirmation and removes all of its stored versions and article bodies. Associated excerpts remain in your library and become unlinked.
