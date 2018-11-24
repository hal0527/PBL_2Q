/**
 * Open a contact URL.
 * @param {Object} e an event object
 * @return {UniversalActionResponse}
 */
function openContactURL(e) {
  // Activate temporary Gmail add-on scopes, in this case so that the
  // open message metadata can be read.
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  // Build URL to open based on a base URL and the sender's email.
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var sender = message.getFrom();
  var url = "https://www.example.com/urlbase/" + sender;
  return CardService.newUniversalActionResponseBuilder()
      .setOpenLink(CardService.newOpenLink()
          .setUrl(url))
      .build();
}

/**
 * Create a collection of cards to control the add-on settings and
 * present other information. These cards are displayed in a list when
 * the user selects the associated "Open settings" universal action.
 *
 * @param {Object} e an event object
 * @return {UniversalActionResponse}
 */
function createSettingsResponse(e) {
  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards(
          [createSettingCard(), createAboutCard()])
      .build();
}

/**
 * Create and return a built settings card.
 * @return {Card}
 */
function createSettingCard() {
  return CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('Settings'))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newSelectionInput()
              .setType(CardService.SelectionInputType.CHECK_BOX)
              .addItem("Ask before deleting contact", "contact", false)
              .addItem("Ask before deleting cache", "cache", false)
              .addItem("Preserve contact ID after deletion", "contactId", false))
          // ... continue adding widgets or other sections here ...
      ).build();   // Don't forget to build the card!
}

/**
 * Create and return a built 'About' informational card.
 * @return {Card}
 */
function createAboutCard() {
  return CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('About'))
      .addSection(CardService.newCardSection()
          .addWidget(CardService.newTextParagraph()
              .setText('This add-on manages contact information. For more '
                  + 'details see the <a href="https://www.example.com/help">'
                  + 'help page</a>.'))
      // ... add other information widgets or sections here ...
      ).build();  // Don't forget to build the card!
}

/**
 * Run background tasks, none of which should alter the UI.
 * Also records the time of sync in the script properties.
 *
 * @param {Object} e an event object
 */
function runBackgroundSync(e) {
  var props = PropertiesService.getUserProperties();
  props.setProperty("syncTime", new Date().toString());

  syncWithContacts();  // Not shown.
  updateCache();       // Not shown.
  validate();          // Not shown.

  // no return value tells the UI to keep showing the current card.
}
