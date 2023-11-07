CKEDITOR.plugins.add( '_publi', {
    icons: 'abbr',
    init: function( editor ) {
        editor.ui.addButton( '_publi', {
            label: 'Insertar publicidad',
            command: 'insertarPublicidad',
            toolbar: 'insert',
            icon : this.path + 'images/icon.png'
        });

        editor.addCommand("insertarPublicidad", {
            exec: function(editor){
                editor.insertHtml(`<div class="publicidad-interna" contenteditable="false" style="background:orange; padding:5px; text-align:center; font-size:1.5rem;" disabled readonly>{{PUBLICIDAD}}</div><br>`);
            }
        })
    }
});