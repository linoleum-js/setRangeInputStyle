/*jslint browser: true, unparam: true, white: true, indent: 2 */

(function (window, document) {
  'use strict';

  var setRangeInputStyle = function (param) {

    if (!param ||
      !param.input ||
      !param.type ||
      !(param.type === 'vertical' || param.type === 'horizontal') ||
      !param.wrap ||
      !param.bar) {
      throw 'styleRangeInput: Invalid argument';
    }
    
    var inputElement,
      min,
      max,
      step,
      value,
      pos,
      wrap,
      progress,
      bar,
      stepSize, // in pixels
      afterMouseup = false,

      $ = document.querySelector.bind(document),
      
      getPosition = function (e) {
        var x = 0,
          y = 0,
          w = e.offsetWidth,
          h = e.offsetHeight;
      
        while (e) {
          x += parseFloat(e.offsetLeft);
          y += parseFloat(e.offsetTop);
          e = e.offsetParent;
        }
        
        return {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h)
        };
      },

      updateRanges = function () {
        max = parseFloat(inputElement.getAttribute('max'));
        min = parseFloat(inputElement.getAttribute('min'));
        step = parseFloat(inputElement.getAttribute('step'));
      },

      update = function () {
        pos = getPosition(wrap);
        if (param.isVolatile) {
          updateRanges();
          if (param.type === 'vertical') {
            stepSize = pos.h * step / (max - min);
          } else {
            stepSize = pos.w * step / (max - min);
          }
        }
      },

      triggerEvent = function () {
        var e = document.createEvent('HTMLEvents');

        e.initEvent('change', false, true);
        inputElement.dispatchEvent(e);
      },

      setAtStepVertical = function (stepNumber, fromInput) {
        var actualPos;

        if (!fromInput) {
          if (param.leading || afterMouseup) {
            afterMouseup = false;
            inputElement.value = max + min - stepNumber * step;
            triggerEvent();
          }
          actualPos = pos.h - (stepNumber - min / step) * stepSize;
        } else {
          actualPos = (stepNumber - min / step) * stepSize;
        }

        bar.style.bottom = actualPos + 'px';
        if (progress) {
          progress.style.height = actualPos + 'px';
        }
      },

      moveVertical = function (x, y) {
        var cursorPos, // in pixels
          nearestStep;

        update();
        y += bar.offsetHeight / 2;

        if (y <= pos.y) {
          cursorPos = 0;
        } else if (y >= pos.y + pos.h) {
          cursorPos = pos.h;
        } else {
          cursorPos = y - pos.y;
        }

        nearestStep = Math.round(cursorPos / stepSize + min / step);
        setAtStepVertical(nearestStep, false);
      },

      setAtStepHorizontal = function (stepNumber, fromEvent) {
        if (!fromEvent && (param.leading || afterMouseup)) {
          afterMouseup = false;
          inputElement.value = stepNumber * step;
          triggerEvent();
        }

        var actualPos = (stepNumber - min / step) * stepSize;

        bar.style.left = actualPos + 'px';
        if (progress) {
          progress.style.width = actualPos + 'px';
        }
      },

      moveHorizontal = function (x, y) {
        var cursorPos, // in pixels
          nearestStep;

        update();
        x -= bar.offsetWidth / 2;

        if (x <= pos.x) {
          cursorPos = 0;
        } else if (x >= pos.x + pos.w) {
          cursorPos = pos.w;
        } else {
          cursorPos = x - pos.x;
        }

        nearestStep = Math.round(cursorPos / stepSize + min / step);
        setAtStepHorizontal(nearestStep, false);
      },

      move,
      set;

    if (param.type === 'vertical') {
      set = setAtStepVertical;
      move = moveVertical;
    } else if (param.type === 'horizontal') {
      set = setAtStepHorizontal;
      move = moveHorizontal;
    }

    // get all elements nodes
    inputElement = $(param.input);
    if (!inputElement) {
      throw 'styleRangeInput: Invalid argument. There\'s no element matched ' + param.input;
    }
    wrap = $(param.wrap);
    if (!wrap) {
      throw 'styleRangeInput: Invalid argument. There\'s no element matched ' + param.wrap; 
    }
    if (param.progress) {
      progress = $(param.progress);
      if (!progress) {
        throw 'styleRangeInput: Invalid argument. There\'s no element matched ' + param.progress;
      }
    }
    bar = $(param.bar);
    if (!bar) {
      throw 'styleRangeInput: Invalid argument. There\'s no element matched ' + param.wrap;
    }

    max = parseFloat(inputElement.getAttribute('max'));
    min = parseFloat(inputElement.getAttribute('min'));
    step = parseFloat(inputElement.getAttribute('step'));
    value = parseFloat(inputElement.getAttribute('value'));

    if (value === undefined) {
      value = (max - Math.abs(min)) / 2;
    }

    //inputElement.style.display = 'none';

    pos = getPosition(wrap);
    if (param.type === 'vertical') {
      stepSize = pos.h * step / (max - min);
    } else {
      stepSize = pos.w * step / (max - min);
    }
    set(value / step, true);

    // start draging
    bar.addEventListener('mousedown', function () {
      bar.caught = true;
    }, false);
    
    wrap.addEventListener('mousedown', function (e) {
      move(e.pageX, e.pageY);
      bar.caught = true;
    }, false);
    
    if (progress) {
      progress.addEventListener('mousedown', function (e) {
        move(e.pageX, e.pageY);
        bar.caught = true;
      }, false);
    }
    
    document.addEventListener('mouseup', function (e) {
      afterMouseup = true;
      if (bar.caught) {
        move(e.pageX, e.pageY);
      }
      bar.caught = false;
    }, false);
    
    document.addEventListener('mousemove', function (e) {
      if (!bar.caught) {
        return;
      }

      e.preventDefault(); // avoid selection
      move(e.pageX, e.pageY);
    }, false);
    
    inputElement.addEventListener('change', function (e) {
      update();
      set(e.target.value / step, true);
    }, false);
  };

  window.setRangeInputStyle = setRangeInputStyle;
}(window, document));


setRangeInputStyle({
  input: '#v-range',

  wrap: '.v-bar-wrap',
  progress: '.v-progress',
  bar: '.v-bar',

  type: 'vertical',
  isVolatile: false,
  leading: true
});

setRangeInputStyle({
  input: '#h-range',

  wrap: '.h-bar-wrap',
  progress: '.h-progress',
  bar: '.h-bar',

  type: 'horizontal',
  isVolatile: false,
  leading: false
});

