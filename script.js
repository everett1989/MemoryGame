$(document).ready(function() {

    var colorStack = [
        'black',
        'red',
        'orange',
        'yellow',
        'purple',
        'pink',
        'blue',
        'green'
    ];
    var testAudio = new Audio('http://static1.grsites.com/archive/sounds/cars/cars013.wav');
    colorStack = colorStack.concat(colorStack);

    var carAmmountSection = colorStack.length / $('.section').length;
    var switchTime = 150;
    var countDownMAX = 5;
    var memorizeTime = countDownMAX * 1000;
    var screenTime = 1000;
    var stackCompare = [];
    var coords = [];


    var lastPick = false;

    var tryCount = 0;
    var tryMAX = 3;

    var resultDiv = $('.result');
    var parkingLotDiv = $('.parkingLot');
    var parkingLotOffset = parkingLotDiv.offset();
    var parkingLotMiddle;


    var cars;
    var carLength;

    initializeGame();

    function initializeGame() {

        var slotWidth;
        var slotHeight;
        var carWidth;
        var carHeight;


        colorStack = shuffleArray(colorStack);
        var carTracker = 0;

        $('.section').each(function(index, value) {


            for (i = 0; i < carAmmountSection; i++) {

                var slot = $('<div/>', {
                    class: 'slot',
                }).appendTo(value);

                if (!slotWidth) {
                    slotWidth = slot.width();
                    slotHeight = slot.height();
                    carWidth = slotWidth - (slotWidth * .2);
                    carHeight = slotHeight - (slotHeight * .2);
                    parkingLotMiddle = (parkingLotDiv.height() / 2) - (carHeight / 2);
                }

                var offsetTop = slot.offset().top + (slotHeight / 2) - (carHeight / 2) - parkingLotOffset.top;
                var offsetLeft = slot.offset().left + (slotWidth / 2) - (carWidth / 2) - parkingLotOffset.left;

                coords.push({
                    top: offsetTop,
                    left: offsetLeft
                });


                $('<span/>', {
                    class: 'car car-' + colorStack[carTracker],
                    'data-color': colorStack[carTracker],
                    css: {
                        height: carHeight,
                        width: carWidth,
                        left: offsetLeft,
                        top: offsetTop
                    }
                }).append('<span class="chek"><span/>').appendTo(parkingLotDiv);
                carTracker++;
            }
        });


    }



    cars = $('.car');
    carLength = cars.length;
    //parkingLotMiddle = $('.parkingLot').height() / 2 - 48;



    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function shuffleCars() {
        coords = shuffleArray(coords);
        //cars = shuffleArray(cars);
        cars.each(function(index, value) {

            var target = coords[index];
            var origin = $(this).offset();

            var middleY = parkingLotDiv.height() / 2;
            var middleYAdjusted = (middleY / 2) - (cars.height() / 2);

            var middleX = parkingLotDiv.width() / 2;


            // where to move for the first step
            var step1 = (origin.top < middleY) ? middleYAdjusted : middleY + middleYAdjusted;

            var quarterLotLeft = (origin.left < middleX) ? 15 : (parkingLotDiv.width() - $(this).width() - 15);

            var quarterLotTop = (target.top < middleY) ? middleYAdjusted : (middleYAdjusted + middleY);

            var isSameRow = (target.top > middleY && origin.top > middleY) || (target.top < middleY && origin.top < middleY);

            function endingMove(car) {
                car.animate({
                    left: target.left + 'px'
                }, switchTime, function() {
                    $(this).animate({
                        top: target.top + 'px'
                    }, switchTime, function() {
                        if (index == carLength - 1) {
                            beginMemorize();
                        }
                    });
                });
            }

            $(value).delay(switchTime * index).animate({
                top: (step1) + 'px'
            }, switchTime, function() {

                if (isSameRow) { // If car target and source in same half

                    endingMove($(this));

                } else { //not in same half

                    $(this).animate({ //move to left side parking lot
                        left: quarterLotLeft + 'px'
                    }, switchTime, function() { // move to middle row of desination
                        $(this).animate({
                            top: quarterLotTop + 'px'
                        }, switchTime, function() {
                            endingMove($(this));
                        });
                    });
                }
            });

        });

    }

    function beginMemorize() {

        var count = countDownMAX;
        var countDown = $('.countDown');
        countDown.show().text(count--);
        var countDownInterval = setInterval(function() {
            countDown.text(count--);
            if (count < 0) {
                countDown.fadeOut();
                clearInterval(countDownInterval);
                cars.addClass('silhouette');
                beginGuess();
            }
        }, 1000);
    }

    function beginGuess() {
        cars.on('click', function() {
            if (stackCompare.length == 2) { //jumps out of funtion if user clicks more than one pair at a time
                return;
            }
            if (stackCompare.length == 1) { //Jumps out of function if user clicks the same car twice
                if (stackCompare[0].object.index() == $(this).index()) {
                    return;
                }
            }


            $(this).removeClass('silhouette');
            var color = $(this).data('color');
            stackCompare.push({
                'color': color,
                'object': $(this)
            });

            if (stackCompare.length == 2) {

                if (stackCompare[0].color == stackCompare[1].color) {
                    stackCompare[0].object.addClass('checked');
                    stackCompare[1].object.addClass('checked');
                    stackCompare = [];
                } else {
                    tryCount++;
                    stackCompare[0].object.addClass('xed');
                    stackCompare[1].object.addClass('xed');

                    setTimeout(function() {
                        if (!lastPick) {
                            stackCompare[0].object.addClass('silhouette').removeClass('xed');
                            stackCompare[1].object.addClass('silhouette').removeClass('xed');
                            stackCompare = [];
                        }
                    }, 1000);


                }
                winOrLose();
            }
        });
    }

    function winOrLose() {
        var checkLength = $('.checked').length;
        var result = '';

        if (tryCount == tryMAX) {
            result = 'You Lose!';
            lastPick = true;
            cars.removeClass('silhouette xed');

        } else if (checkLength == carLength) {
            result = 'You Win!';
        }

        if (result != '') {
            resultDiv.children('h1').text(result)
                .end().fadeIn(screenTime);
        }
    }




    function resetGame() {
        cars.removeClass('checked silhouette').removeClass('xed');
        resultDiv.fadeOut();

        stackCompare = [];
        tryCount = 0;
        lastPick = false;
    }

    function beginGame() {

        testAudio.play();
        $('.opening').fadeOut(screenTime, function() {
            shuffleCars();
        });
        cars.off();
    }



    $('.beginButton').on('click', function() {
        beginGame();
    });

    $('.playAgain').on('click', function() {
        resetGame();
        beginGame();
    });



});
