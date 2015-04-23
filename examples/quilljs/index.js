if(Quill == null){
  alert("You must download quilljs! It needs to be in the same directory as y-richtext!");
}

var quill = new Quill('#editor', {
    modules: {
        'multi-cursor': true,
        'link-tooltip': true,
        'image-tooltip': true
    },
    theme: 'snow'
});
quill.addModule('toolbar', { container: '#toolbar' });
window.connector = new Y.WebRTC('sqfjqsmdlkjrhguemslkfjmlsdkjf');
/* window.connector = new Y.WebRTC('sqfjqsmdlkjrhguemslkfjmlsdkjf',
    {url: 'http://localhost:8888'}); */
// connector.debug = true;
window.y = new Y(connector);

// TODO: only for debugging
// y.HB.setGarbageCollectTimeout(2000)
y.observe (function (events) {
    for (i in events){
        if(events[i].name === 'editor'){
            y.val('editor').bind('QuillJs', quill);
            window.editor = y.val('editor')
        }
    }
});

connector.whenSynced(function(){
    if(y.val('editor') == null){
        y.val('editor', new Y.RichText("QuillJs", quill));
    }
});
