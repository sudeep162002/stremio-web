const pako = require('pako');

const serializeStream = (stream) => {
    return btoa(pako.deflate(JSON.stringify(stream), { to: 'string' }));
};

const deserializeStream = (stream) => {
    return JSON.parse(pako.inflate(atob(stream), { to: 'string' }));
};

const withMetaItem = ({ metaItem }) => {
    return {
        meta_details_videos: typeof metaItem.behaviorHints.defaultVideoId !== 'string' ?
            `#/metadetails/${encodeURIComponent(metaItem.type)}/${encodeURIComponent(metaItem.id)}`
            :
            null,
        meta_details_streams: typeof metaItem.behaviorHints.defaultVideoId === 'string' ?
            `#/metadetails/${encodeURIComponent(metaItem.type)}/${encodeURIComponent(metaItem.id)}/${encodeURIComponent(metaItem.behaviorHints.defaultVideoId)}`
            :
            null
    };
};

const withMetaResource = ({ metaResource, type, id }) => {
    const queryParams = new URLSearchParams([['metaTransportUrl', metaResource.request.base]]);
    const videoId = metaResource.content.type === 'Ready' ?
        typeof metaResource.content.content.behaviorHints.videoId === 'string' ?
            metaResource.content.content.behaviorHints.videoId
            :
            metaResource.content.content.videos.length === 1 ?
                metaResource.content.content.videos[0].id
                :
                metaResource.content.content.videos.find((video) => video.id === id) || null
        :
        null;
    return {
        meta_details_videos: `#/metadetails/${encodeURIComponent(type)}/${encodeURIComponent(id)}?${queryParams.toString()}`,
        meta_details_streams: typeof videoId === 'string' ?
            `#/metadetails/${encodeURIComponent(type)}/${encodeURIComponent(id)}/${encodeURIComponent(videoId)}?${queryParams.toString()}`
            :
            null
    };
};

const withLibItem = ({ libItem, streams = {} }) => {
    const [stream, streamTransportUrl, metaTransportUrl] = typeof libItem.state.video_id === 'string' && typeof streams[`${encodeURIComponent(libItem._id)}/${encodeURIComponent(libItem.state.video_id)}`] === 'object' ?
        streams[`${encodeURIComponent(libItem._id)}/${encodeURIComponent(libItem.state.video_id)}`]
        :
        [];
    return {
        meta_details_videos: typeof libItem.behaviorHints.defaultVideoId !== 'string' ?
            `#/metadetails/${encodeURIComponent(libItem.type)}/${encodeURIComponent(libItem._id)}`
            :
            null,
        meta_details_streams: typeof libItem.state.video_id === 'string' ?
            `#/metadetails/${encodeURIComponent(libItem.type)}/${encodeURIComponent(libItem._id)}/${encodeURIComponent(libItem.state.video_id)}`
            :
            typeof libItem.behaviorHints.defaultVideoId === 'string' ?
                `#/metadetails/${encodeURIComponent(libItem.type)}/${encodeURIComponent(libItem._id)}/${encodeURIComponent(libItem.behaviorHints.defaultVideoId)}`
                :
                null,
        // TODO check if stream is external
        player: typeof libItem.state.video_id === 'string' && typeof stream === 'object' && typeof streamTransportUrl === 'string' && typeof metaTransportUrl === 'string' ?
            `#/player/${encodeURIComponent(serializeStream(stream))}/${encodeURIComponent(streamTransportUrl)}/${encodeURIComponent(metaTransportUrl)}/${encodeURIComponent(libItem.type)}/${encodeURIComponent(libItem._id)}/${encodeURIComponent(libItem.state.video_id)}`
            :
            null
    };
};

const withVideo = ({ video, metaTransportUrl, metaItem, streams = {} }) => {
    const queryParams = new URLSearchParams([['metaTransportUrl', metaTransportUrl]]);
    const [stream, streamTransportUrl] = typeof streams[`${encodeURIComponent(metaItem.id)}/${encodeURIComponent(video.id)}`] === 'object' ?
        streams[`${encodeURIComponent(metaItem.id)}/${encodeURIComponent(video.id)}`]
        :
        [];
    return {
        meta_details_streams: `#/metadetails/${encodeURIComponent(metaItem.type)}/${encodeURIComponent(metaItem.id)}/${encodeURIComponent(video.id)}?${queryParams.toString()}`,
        // TODO check if stream is external
        player: typeof stream === 'object' && typeof streamTransportUrl === 'string' ?
            `#/player/${encodeURIComponent(serializeStream(stream))}/${encodeURIComponent(streamTransportUrl)}/${encodeURIComponent(metaTransportUrl)}/${encodeURIComponent(metaItem.type)}/${encodeURIComponent(metaItem.id)}/${encodeURIComponent(video.id)}`
            :
            Array.isArray(video.streams) && video.streams.length === 1 ?
                `#/player/${encodeURIComponent(serializeStream(video.streams[0]))}/${encodeURIComponent(metaTransportUrl)}/${encodeURIComponent(metaTransportUrl)}/${encodeURIComponent(metaItem.type)}/${encodeURIComponent(metaItem.id)}/${encodeURIComponent(video.id)}`
                :
                null
    };
};

const withStream = ({ stream, streamTransportUrl, metaTransportUrl, type, id, videoId }) => {
    return {
        player: typeof metaTransportUrl === 'string' && typeof type === 'string' && typeof id === 'string' && typeof videoId === 'string' ?
            `#/player/${encodeURIComponent(serializeStream(stream))}/${encodeURIComponent(streamTransportUrl)}/${encodeURIComponent(metaTransportUrl)}/${encodeURIComponent(type)}/${encodeURIComponent(id)}/${encodeURIComponent(videoId)}`
            :
            `#/player/${encodeURIComponent(serializeStream(stream))}`
    };
};

const withCatalog = ({ request }) => {
    return {
        discover: `#/discover/${encodeURIComponent(request.base)}/${encodeURIComponent(request.path.type_name)}/${encodeURIComponent(request.path.id)}?${new URLSearchParams(request.path.extra).toString()}`
    };
};

module.exports = {
    withCatalog,
    withMetaItem,
    withMetaResource,
    withLibItem,
    withVideo,
    withStream,
    serializeStream,
    deserializeStream
};
