function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	document.getElementById('numberTweets').innerText = tweet_array.length;	

    let completedEventsCount = 0;
    let liveEventsCount = 0;
    let achievementsCount = 0;
    let miscellaneousCount = 0;
    let userWrittenCount = 0;

    let earliestTweet = tweet_array[0].time;
    let latestTweet = tweet_array[0].time;

    tweet_array.forEach(function(tweet) {
        if(tweet.time < earliestTweet) earliestTweet = tweet.time;
        if(tweet.time > latestTweet) latestTweet = tweet.time;

        switch(tweet.source) {
            case "completed_event":
                completedEventsCount++;
                break;
            case "live_event":
                liveEventsCount++;
                break;
            case "achievement":
                achievementsCount++;
                break;
            case "miscellaneous":
                miscellaneousCount++;
                break;
        }

        if(tweet.written) userWrittenCount++;
    });

    document.getElementById('firstDate').innerText = new Date(earliestTweet).toLocaleDateString();
    document.getElementById('lastDate').innerText = new Date(latestTweet).toLocaleDateString();

    let completedEventsElements = document.querySelectorAll('.completedEvents');
    
	completedEventsElements.forEach(function(element) {
        element.innerText = completedEventsCount;
    });
	
	document.querySelector('.liveEvents').innerText = liveEventsCount;
    document.querySelector('.achievements').innerText = achievementsCount;
    document.querySelector('.miscellaneous').innerText = miscellaneousCount;

    let percentUserWritten = (userWrittenCount / completedEventsCount * 100).toFixed(2);
    document.querySelector('.written').innerText = userWrittenCount;
    document.querySelector('.writtenPct').innerText = percentUserWritten + '%';

    let completedEventsPct = (completedEventsCount / tweet_array.length * 100).toFixed(2);
    document.querySelector('.completedEventsPct').innerText = completedEventsPct + '%';
    let liveEventsPct = (liveEventsCount / tweet_array.length * 100).toFixed(2);
    document.querySelector('.liveEventsPct').innerText = liveEventsPct + '%';
    let achievementsPct = (achievementsCount / tweet_array.length * 100).toFixed(2);
    document.querySelector('.achievementsPct').innerText = achievementsPct + '%';
    let miscellaneousPct = (miscellaneousCount / tweet_array.length * 100).toFixed(2);
    document.querySelector('.miscellaneousPct').innerText = miscellaneousPct + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});