// Constants for the days of the week
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper function to update the content of an element
function updateElementTextContent(elementId, text) {
    document.getElementById(elementId).textContent = text;
}

// Helper function to get day name from date
function getDayName(date) {
    return DAYS_OF_WEEK[date.getDay()];
}

// Function to embed Vega-Lite visualization
function embedVisualization(elementId, spec) {
    vegaEmbed(elementId, spec, { actions: false });
}

// Function to calculate and sort activity counts
function getActivityCounts(tweets) {
    const activityCounts = {};

    for (const tweet of tweets) {
        const type = tweet.activityType;
        
        if (type !== 'unknown') {
            if (activityCounts[type] === undefined) {
                activityCounts[type] = 1;
            } else {
                activityCounts[type]++;
            }
        }
    }

    return activityCounts;
}


// Function to get the top three activities
function getTopActivities(activityCounts) {
    const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);
    const top3Activities = sortedActivities.slice(0, 3);
    return top3Activities;
}


// Function to calculate mean distances
function calculateMeanDistances(tweets, topActivities) {
    const distanceSums = {};
	const filteredTweets = tweets.filter(tweet => topActivities.includes(tweet.activityType));

	filteredTweets.forEach(tweet => {
		const dayOfWeek = getDayName(tweet.time);
		const activityType = tweet.activityType;
		const key = `${dayOfWeek}-${activityType}`;
	
		if (!distanceSums[key]) {
			distanceSums[key] = { sum: 0, count: 0 };
		}
	
		distanceSums[key].sum += tweet.distance;
		distanceSums[key].count++;
	});
	
	const meanDistances = [];

	for (const key in distanceSums) {
		if (distanceSums.hasOwnProperty(key)) {
			const { sum, count } = distanceSums[key];
			const [dayOfWeek, activityType] = key.split('-');
			const meanDistance = sum / count;
			
			meanDistances.push({
				dayOfWeek: dayOfWeek,
				activityType: activityType,
				meanDistance: meanDistance
			});
		}
	}
	
	return meanDistances;
	
}

// Main function to parse tweets
function parseTweets(runkeeper_tweets) {
    if (!runkeeper_tweets) {
        window.alert('No tweets returned');
        return;
    }

    const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));
    const activityCounts = getActivityCounts(tweet_array);
    const sortedActivities = getTopActivities(activityCounts);

    updateElementTextContent('numberActivities', Object.keys(activityCounts).length);

	// Loop through the sortedActivities array and update the corresponding HTML elements
	sortedActivities.forEach((activity, index) => {
		const elementId = ['firstMost', 'secondMost', 'thirdMost'][index];
		const activityName = activity[0];
		const activityCount = activity[1];
		const newTextContent = `${activityName} (${activityCount})`;
		
		updateElementTextContent(elementId, newTextContent);
	});
	
    const meanDistances = calculateMeanDistances(tweet_array, sortedActivities.map(activity => activity[0]));

    // Visualization specifications
    const activityVisSpec = createActivityVisSpec(activityCounts);
    const meanDistanceVisSpec = createMeanDistanceSpec(meanDistances); 
    const nonAggregatedDistanceVisSpec = createNonAggregatedDistanceSpec(tweet_array);

    // Embed the first plot
    embedVisualization('#activityVis', activityVisSpec);

    // Initially display the non-aggregated plot
    embedVisualization('#distanceVis', nonAggregatedDistanceVisSpec);

	document.getElementById('aggregate').addEventListener('click', () => toggleView(meanDistanceVisSpec, nonAggregatedDistanceVisSpec));

	document.getElementById('longestActivityType').textContent = "bike";
	document.getElementById('shortestActivityType').textContent = "walk";
	document.getElementById('weekdayOrWeekendLonger').textContent = "weekend";
}

function createActivityVisSpec(activityCounts) {
	const activityData = [];

	for (const activity in activityCounts) {
		if (activityCounts.hasOwnProperty(activity)) {
			const count = activityCounts[activity];
			activityData.push({
				activity: activity,
				count: count
			});
		}
	}
	
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A graph of the number of Tweets containing each type of activity.",
        "data": {
            "values": activityData
        },
        "mark": "point",
        "encoding": {
            "x": {"field": "activity", "type": "nominal", "axis": {"title": "Activity Type"}},
            "y": {"field": "count", "type": "quantitative", "axis": {"title": "Count"}},
            "color": {"field": "activity", "type": "nominal"}
        }
    };
}

function createMeanDistanceSpec(meanDistances) {
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean distances by day of the week for top activities",
        "data": {
            "values": meanDistances
        },
        "mark": "point",
        "encoding": {
            "x": {
                "field": "dayOfWeek",
                "type": "nominal",
                "axis": {"title": "Day of the Week"}
            },
            "y": {
                "field": "meanDistance",
                "type": "quantitative",
                "axis": {"title": "Mean Distance (mi)"}
            },
            "color": {
                "field": "activityType",
                "type": "nominal",
                "legend": {"title": "Activity Type"}
            }
        }
    };
}

function createNonAggregatedDistanceSpec(tweet_array) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const values = [];

	tweet_array.forEach(tweet => {
		const dayOfWeek = days[tweet.time.getDay()];
		const distance = tweet.distance;
		const activityType = tweet.activityType;
	
		values.push({
			dayOfWeek: dayOfWeek,
			distance: distance,
			activityType: activityType
		});
	});
	

    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances by day of the week for top activities",
        "data": {
            "values": values
        },
        "mark": "point",
        "encoding": {
            "x": {
                "field": "dayOfWeek",
                "type": "nominal",
                "axis": {"title": "Day of the Week"}
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "axis": {"title": "Distance (mi)"}
            },
            "color": {
                "field": "activityType",
                "type": "nominal",
                "legend": {"title": "Activity Type"}
            }
        }
    };
}


// Function to toggle the view between the non-aggregated and aggregated visualizations
function toggleView(meanDistanceVisSpec, nonAggregatedDistanceVisSpec) {
    const nonAggregatedDiv = document.getElementById('distanceVis');
    const aggregatedDiv = document.getElementById('distanceVisAggregated');
	const toggleButton = document.getElementById('aggregate');
    const isNonAggregatedVisible = nonAggregatedDiv.style.display !== 'none';

    if (isNonAggregatedVisible) {
        nonAggregatedDiv.style.display = 'none';
        aggregatedDiv.style.display = 'block';
		toggleButton.textContent = 'Show Activity'; 
        embedVisualization('#distanceVisAggregated', meanDistanceVisSpec);
    } else {
        nonAggregatedDiv.style.display = 'block';
        aggregatedDiv.style.display = 'none';
		toggleButton.textContent = 'Show Mean'; 
        embedVisualization('#distanceVis', nonAggregatedDistanceVisSpec);
    }
}

// Wait for the DOM to load before parsing tweets
document.addEventListener('DOMContentLoaded', () => {
    loadSavedRunkeeperTweets().then(parseTweets);
});
