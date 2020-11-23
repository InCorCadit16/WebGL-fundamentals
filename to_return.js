

 <div>
 <h1>File reader</h1>
 <input type="file" id="file-input" style="display:block; font-size: 18px; " />
</div>

transformMatrix 
            .setTranslate(figure.moveX,
                            figure.moveY,
                            figure.moveZ)
            .scale(figure.scale, figure.scale, figure.scale)
            
var defaultTranslate = new Matrix4();
defaultTranslate 
    .setTranslate(figure.defaultTranslate[0],
                    figure.defaultTranslate[1],
                    figure.defaultTranslate[2]);

transformMatrix.multiply(defaultTranslate);


document.querySelector("#file-input").addEventListener('change', function() {
    var selectedFiles = this.files;
    if(selectedFiles.length == 0) {
        alert('Error : No file selected');
        return;
    }
    var firstFile = selectedFiles[0];
    readTextFromFile(firstFile);
});




function readTextFromFile(file) {
    var reader = new FileReader(); 
    reader.addEventListener('load', function(e) {
        var text = e.target.result;
        res = text.split("\n").filter(elem => elem[0] == 'v' && elem[1] == 'n');
        normals = res.map(x => x.slice(3).split(" "));
        vertices = res2.map(x => x.map(y => parseFloat(y)-1));
        debugger;
    });

    reader.addEventListener('error', function() {
        alert('File error happened!');
    });

    reader.readAsText(file); 
}