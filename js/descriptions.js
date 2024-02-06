let allTweetInstances = []; // Hold all Tweet instances

function displayTweets(tweets) {
    const tableBody = document.getElementById('tweetTable');
    let rowsHtml = ''; // Initialize an empty string to hold all the HTML for the rows

    tweets.forEach((tweet, index) => {
        rowsHtml += tweet.getHTMLTableRow(index + 1); 
    });

    tableBody.innerHTML = rowsHtml; 
}

function parseTweets(runkeeper_tweets) {
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // Create Tweet instances once and reuse them
    allTweetInstances = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

    // Filter and display written tweets initially
    displayTweets(allTweetInstances.filter(tweet => tweet.written));
}

function addEventHandlerForSearch() {
    const searchText = document.getElementById('textFilter');
    searchText.addEventListener('input', function(event) {
        const searchQuery = event.target.value.toLowerCase();

        // Filter the already created Tweet instances based on the search query
		const matchingTweets = allTweetInstances.filter(function(tweet) {
			if (tweet.written && tweet.writtenText.toLowerCase().includes(searchQuery)) {
				return true;
			}
			return false;
		});
		

        displayTweets(matchingTweets); 

        document.getElementById('searchCount').textContent = matchingTweets.length;
        document.getElementById('searchText').textContent = searchQuery;
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(parseTweets);
});
