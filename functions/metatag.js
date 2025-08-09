function generateMetaTags({ url, title = '', description = '', image = '' }){
    const baseUrl = 'website.com';

    return `
    <title>title</title>
    <meta name="description" content= "{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="baseUrl(url)">
    <meta property="og:title" content="title">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="image || baseUrl + '/default-thumbnail.jpg'">
    <meta property="og:url" content="{baseUrl}${url}">
    <meta property="og:type" content="website">
    `;
}

module.exports = generateMetaTags;