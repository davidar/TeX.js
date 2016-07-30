var s = document.createElement('script');
//s.setAttribute('data-main', '//localhost:8000/main');
s.setAttribute('data-main', '//texify.davidar.io/main');
s.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js');
if(document.body !== null) {
    document.body.appendChild(s);
} else {
    document.head.appendChild(s);
}
