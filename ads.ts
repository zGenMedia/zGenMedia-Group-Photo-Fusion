// ads.ts

export interface Ad {
    imageUrl: string; // The URL for the banner image
    linkUrl: string;  // The destination URL when the ad is clicked
}

// Banner placed at the top of the main content area
export const topLeaderboardAds: Ad[] = [
    {
        imageUrl: 'https://blkcosmo.com/wp-content/uploads/2025/02/Black-and-White-Modern-New-Collection-Fashion-Instagram-Post-Leaderboard-ad.png',
        linkUrl: 'https://www.amazon.com/shop/blackcosmopolitan/list/KB55L25J8VFJ?ref_=aip_sf_list_spv_ons_mixed_d'
    }
    // You can add more ads to this array in the future.
    // The app currently only displays the first one.
];

// Banner placed in the footer, at the bottom of the page
export const bottomLeaderboardAds: Ad[] = [
     {
        imageUrl: 'https://blkcosmo.com/wp-content/uploads/2025/06/Red-and-Blue-Modern-Professional-Business-Service-Advertising-Instagram-Post.png',
        linkUrl: 'https://zgenmedia.com/'
    }
    // You can add more ads here.
];

// This array is for popup/modal ads. It's defined but not used in the current app.
// You could build a modal component that uses this data.
export const popupAds: Ad[] = [
    {
        imageUrl: 'https://blkcosmo.com/wp-content/uploads/2025/02/50-off-square-ad.png',
        linkUrl: 'https://www.amazon.com/shop/blackcosmopolitan'
    }
];
