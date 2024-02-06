type TweetSource = 'completed_event' | 'achievement' | 'live_event' | 'miscellaneous';

class Tweet {
    text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);
    }

    get source(): TweetSource {
        if (this.text.startsWith("Just completed")) {
            return "completed_event";
        } else if (this.text.startsWith("Just posted")) {
            return "achievement";
        } else if (this.text.startsWith("Watch")) {
            return "live_event";
        }
        return "miscellaneous";
    }

    get written(): boolean {
        return this.text.includes(' - ');
    }

    get writtenText(): string {
        if (this.written) {
            const dashIndex = this.text.indexOf(' - ');
            const urlIndex = this.text.indexOf('https://');
            return urlIndex !== -1 ? this.text.slice(dashIndex + 3, urlIndex).trim() : "";
        }
        return "";
    }

    get activityType(): string {
        if (this.source !== 'completed_event') {
            return "unknown";
        }
        const activityTypes = ['run', 'walk', 'bike'];
        for (let type of activityTypes) {
            if (this.text.includes(` km ${type}`) || this.text.includes(` mi ${type}`)) {
                return type;
            }
        }
        return 'unknown';
    }

    get distance(): number {
        if (this.source !== 'completed_event') {
            return 0;
        }
        const distanceRegex = /([\d.]+) (km|mi)/;
        const match = this.text.match(distanceRegex);
        if (match) {
            let distance = parseFloat(match[1]);
            const unit = match[2];
            if (unit === 'km') {
                distance /= 1.60934; // Convert km to mi
            }
            return distance;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber: number): string {
        const linkRegex = /(https:\/\/t\.co\/\w+)/g;
        const tweetTextWithClickableLinks = this.text.replace(linkRegex, (match) => `<a href="${match}" target="_blank">${match}</a>`);

        return `
            <tr>
                <td>${rowNumber}</td>
                <td>${this.activityType.charAt(0).toUpperCase() + this.activityType.slice(1)}</td>
                <td>${tweetTextWithClickableLinks}</td>
            </tr>
        `;
    }
}
