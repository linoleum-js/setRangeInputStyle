<h2>Plugin to style input[type=range]. Works in modern opera, ff and chrome.</h2>

<h3>Usage:</h3>
<code><pre>
  setRangeInputStyle({
    input: '%selector of input element%',

    wrap: '%selector of container%',
    progress: '%selector of progress bar%', // optional
    bar: '%selector of slider%',

    type: '%type%', // horizontal or vertical
    isVolatile: false || true, // set true if max, min or step of input can be change by any other script
    leading: false || true // set true, if event must be triggered on mouse moving, not only on drag end
  });
</pre></code>