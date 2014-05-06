/*
 * Calculate OpenSubtitles hash
 * (Oscar Brito - aetheon@gmail.com)
 *
 * @param {File} file - a File obj contained on a DataTransfer
 * @param {Function} onComplete - the result callback
 */
 var OpenSubtitlesHash = function(file, onComplete){

    var HASH_CHUNK_SIZE = 64 * 1024;
    if(file.size<HASH_CHUNK_SIZE)
        HASH_CHUNK_SIZE = file.size;


    // sum chunk long values
    var sumChunk = function(arrayBuffer){

        var view = new DataView(arrayBuffer);
        var hNumber = new dcodeIO.Long();

        for(var i=0; i<arrayBuffer.byteLength; i+=8){

            var low = view.getUint32(i, true);
            var high = view.getUint32(i+4, true);

            var n = new dcodeIO.Long(low, high);
            hNumber = hNumber.add(n);
        }

        return hNumber;

    };


    // read chunk
    var readChunk = function(start, end, callback){

        var reader = new FileReader();
        reader.onload = function(e){ 

            // sum all long values on the chunk
            var number = sumChunk(e.currentTarget.result);
            
            if(callback)
                callback(number);

        }

        var blob = file.slice(start, end);
        reader.readAsArrayBuffer(blob);
    };









    // read the first chunk
    readChunk(0, HASH_CHUNK_SIZE, function(head){

        // read the tail chunk
        var start = file.size-HASH_CHUNK_SIZE;
        if(start < 0)
            start = 0;

        readChunk(start, file.size, function(tail){

            // sum all values            
            var sum = head.add(tail).add(new dcodeIO.Long(file.size));
            // convert to hex
            var sumHex = sum.toString(16);

            if(onComplete) 
                onComplete(sumHex);

        });

    });
    
};

// TODO
$(document).ready(function() {
    var obj = $("#search_field");
    obj.on('dragenter', function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border', '2px solid #0B85A1');
    });
    obj.on('dragover', function (e) 
    {
       e.stopPropagation();
       e.preventDefault();
   });
    obj.on('drop', function (e) 
    {

       $(this).css('border', '2px dotted #0B85A1');
       e.preventDefault();
       var files = e.originalEvent.dataTransfer.files;
       obj.html('<i class="fa fa-file fa-5x"></i> <p id="caption-film"></p>');
     //We need to send dropped files to Server
     $.each(files, function(index, file) {

        OpenSubtitlesHash(file, function(hash){
                $("#caption-film").html(file.name);
                $("#file-size").val(file.size);
                $("#file-hash").val(hash);

            })

    });
 });


});

