/** Defined on a per-page basis */
export interface PartialPageData {
    title:	    string;
    longTitle?: string;
    thumbnail?: string;
}

/** Has everything */
export interface FullPageData extends PartialPageData {
    titlePath: string[];
}

export function defineData( loadParent: () => FullPageData, data: PartialPageData ): () => FullPageData {
    return () => {
        let parentData = loadParent();
        parentData.longTitle = undefined;
        const childData: FullPageData = {
            ...parentData,
            ...data,
        };
        childData.titlePath.push(data.title);
        return childData
    }
}