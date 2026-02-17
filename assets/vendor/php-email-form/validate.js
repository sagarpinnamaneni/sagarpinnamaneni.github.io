/**
* PHP Email Form Validation - v3.5
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";
  console.log('validate.js loaded and executing'); // Debug point - confirm script loads and runs

  let forms = document.querySelectorAll('.php-email-form');
  console.log('validate.js: Forms found:', forms.length, forms); // Debug point 1

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('validate.js: Submit event triggered for form:', this); // Debug point 2

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!')
        console.error('validate.js: Form action not set!'); // Debug point 3
        return;
      }
      
      console.log('validate.js: Showing loading indicator'); // Debug point 4
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error)
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        console.log('validate.js: Calling php_email_form_submit (without recaptcha)'); // Debug point 5
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    console.log('php_email_form_submit: Sending request to:', action); // Debug point 6
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      console.log('php_email_form_submit: Received response:', response); // Debug point 7
      return response.text();
    })
    .then(data => {
      console.log('php_email_form_submit: Received data:', data); // Debug point 8
      thisForm.querySelector('.loading').classList.remove('d-block');
      
      let responseJson;
      try {
        responseJson = JSON.parse(data);
      } catch (e) {
        // If it's not JSON, it might be the old "OK" string or a plain error message
        if (data.trim() === 'OK') {
          console.log('php_email_form_submit: Form submission successful (old format)!'); // Debug point 9
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
          return;
        }
        // If not "OK" and not JSON, it's an actual error
        throw new Error(data ? data : 'Form submission failed and response was not JSON or "OK".');
      }

      // Handle Formspree's JSON response
      if (responseJson.ok === true) { // <--- CORRECTED LOGIC
        console.log('php_email_form_submit: Form submission successful (Formspree JSON)!'); // Debug point 9
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
      } else {
        console.error('php_email_form_submit: Form submission failed (Formspree JSON), data:', responseJson); // Debug point 10
        throw new Error(responseJson.error || 'Form submission failed with unknown Formspree JSON error.');
      }
    })
    .catch((error) => {
      console.error('php_email_form_submit: Fetch error:', error); // Debug point 11
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    console.error('displayError called:', error); // Debug point 12
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();