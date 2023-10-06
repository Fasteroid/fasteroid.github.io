export function defineData( loadParent: () => FullPageData, data: PartialPageData ): () => FullPageData {
    return () => {
        const childData: FullPageData = {
            ...loadParent(),
            ...data,
        };
        childData.titlePath.push(data.title);
        return childData
    }
}