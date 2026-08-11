export function getCSSMask(imageUrl) {
    if (!imageUrl)
        return undefined;
    const cssUrl = `url("${imageUrl.replace(/"/g, `'`)}")`;
    return { maskImage: cssUrl, WebkitMaskImage: cssUrl };
}
//# sourceMappingURL=data-url.js.map