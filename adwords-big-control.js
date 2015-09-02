function raiseKeywordBids(KEYWORDS, TARGET_AVERAGE_POSITION, TOLERANCE, BID_ADJUSTMENT_COEFFICIENT, DATE_RANGE) {
  // Condition to raise bid: Average position is greater (worse) than
  // target + tolerance
  var keywordsToRaise = KEYWORDS
    .withCondition("Status = ENABLED")
    .withCondition("AveragePosition > " + (TARGET_AVERAGE_POSITION + TOLERANCE))
    .orderBy("AveragePosition ASC")
    .forDateRange(DATE_RANGE)
    .get();

  while (keywordsToRaise.hasNext()) {
    var keyword = keywordsToRaise.next();
    keyword.setMaxCpc(keyword.getMaxCpc() * BID_ADJUSTMENT_COEFFICIENT);
  }
}

function lowerKeywordBids(KEYWORDS, TARGET_AVERAGE_POSITION, TOLERANCE, BID_ADJUSTMENT_COEFFICIENT, DATE_RANGE) {
  // Conditions to lower bid: Ctr greater than 1% AND
  // average position better (less) than target - tolerance
  var keywordsToLower = KEYWORDS
    .withCondition("Ctr > 0.01")
    .withCondition("AveragePosition < " + (TARGET_AVERAGE_POSITION - TOLERANCE))
    .withCondition("Status = ENABLED")
    .orderBy("AveragePosition DESC")
    .forDateRange(DATE_RANGE)
    .get();

  while (keywordsToLower.hasNext()) {
    var keyword = keywordsToLower.next();
    keyword.setMaxCpc(keyword.getMaxCpc() / BID_ADJUSTMENT_COEFFICIENT);
  }
}

// Returns Campaign if they exist
function getCampaign(NAME) {
  var campaignIterator = AdWordsApp.campaigns()
      .withCondition('Name = "'+NAME+'"')
      .get();
  if (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    return campaign;
  } else {
  	Logger.log("Failed to find campaign.");
  	return false;
  }
}

// Throttle bids
// NAME: Name of campaign.
// TARGET_AVERAGE_POSITION: Ad position you are trying to achieve.
// TOLERANCE: Once the keywords fall within TOLERANCE of TARGET_AVERAGE_POSITION,
// their bids will no longer be adjusted.
// BID_ADJUSTMENT_COEFFICIENT: How much to adjust the bids.
// DATE_RANGE: Range of days to gather data from.
function throttleBids(NAME, TARGET_AVERAGE_POSITION, TOLERANCE, BID_ADJUSTMENT_COEFFICIENT, DATE_RANGE) {
	var campaign = getCampaign(NAME);
	if (campaign) {
		var keywords = campaign.keywords();
		raiseKeywordBids(keywords, TARGET_AVERAGE_POSITION, TOLERANCE, BID_ADJUSTMENT_COEFFICIENT, DATE_RANGE);
		lowerKeywordBids(keywords, TARGET_AVERAGE_POSITION, TOLERANCE, BID_ADJUSTMENT_COEFFICIENT, DATE_RANGE);
	}
}

// Call functions here.
function main() {
	throttleBids("Campaign Name", 1, 0.1, 1.50, "LAST_7_DAYS");
}
