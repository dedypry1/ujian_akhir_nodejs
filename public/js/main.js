$(function(){
	ClassicEditor.create(document.querySelector('#editor'))
	.catch(error=>{
		console.error(error);
	});

	$('a.confirmDeletion').click(function(){
		if(!confirm('Apakah anda yakin ingin menghapus page ini?')){
			return false;
		}
	});

	$('a.confirmDeletionCat').click(function(){
		if(!confirm('Apakah anda yakin ingin menghapus Categories ini?')){
			return false;
		}
	});

	$('a.confirmDeletionProduct').click(function(){
		if(!confirm('Apakah anda yakin ingin menghapus Product ini?')){
			return false;
		}
	});
});