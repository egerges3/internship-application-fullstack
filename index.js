addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class ElementHandler {
  constructor(variant){
    this.variant = variant;
  }
  element(element) {
    //Using HTMLRewriter to change variant 1 (Google Page)
    if (this.variant == 0) {
      //title
      if (element.tagName == 'title') {
        element.setInnerContent('Google Variant');
      //h1#title
      } else if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
        element.setInnerContent('Google Variant');
      //p#description
      } else if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
        element.setInnerContent('Variant 1 - This variant will take you to google.com.');
      }
      //a#url
      else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
        element.setAttribute('href', 'https://google.com');
        element.setInnerContent('Go to google.com')
      }

    //Using HTMLRewriter to change variant 2 (GitHub Pgge)
    } else if (this.variant == 1){
      //title
      if (element.tagName == 'title') {
        element.setInnerContent('Github Variant');
      //h1#title
      } else if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
        element.setInnerContent('Elio Gerges\' Github Variant');
      //p#description
      } else if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
        element.setInnerContent('Variant 2 - This variant will take you to my Github.');
      }
      //a#url
      else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
        element.setAttribute('href', 'https://github.com/egerges3');
        element.setInnerContent('Go to my Github!')
      }
    }
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
      response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
      data = await response.json();
      variants = data.variants;

      var cookie = request.headers.get('cookie');
      var index;
      var url;

      //If cookie exists, use that to load the index
      if (cookie != null) {
        cookies = cookie.split(';');
        cookies.forEach(cookie => {
          c = cookie.split('=')[0].trim();
          if (c == 'index') {
            index = cookie.split('=')[1];
          }
        })
      }
      //If the index is/still is null, get a random one
      if (index == null) {
          var rand = Math.random();
          index = (rand <= .5 ? 0 : 1);   
      }

      url = variants[index];

      response = await fetch(url);
      html = await response.text();  
      response = new Response(html, {
        headers : {'content-type': 'text/html',
        'set-cookie': 'index='+index+';'}, 
      });
      return new HTMLRewriter().on('*', new ElementHandler(index)).transform(response);
  } catch (err) {
      return new Response(err.stack || err)
  }
}