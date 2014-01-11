function Walker(name) {
    this.init(name);
    this.steps();
}

walker.prototype.init = function(name) {
    this.posX = Math.floor(Math.random() * window.innerWidth);
    this.posY = Math.floor(Math.random() * window.innerHeight);
    this.name = name;
    var radius = Math.random() * 100 + 100;
    $('.template')
        .clone()
        .css('background-color', getBgColor())
        .css('width', radius)
        .css('height', radius)
        .attr({
            'id': name
        })
    // .children() //all nested elements indside '.template'
    .html('<br><br><br>' + name)
    // .parent() // goes back up tp '.template'
    .removeClass('template')
        .appendTo('#d_walker_container');
    // console.log(this.name);
};

walker.prototype.steps = function() {
    var that = this;
    setInterval(function() {
            var step = Math.floor(Math.random() * 4);
            // console.log(step);
            if (step == 0) {
                that.posX++;
                // console.log(that.posX + " " + that.posY);
            } else if (step == 1) {
                that.posX--;
                // console.log(that.posX + " " + that.posY);
            } else if (step == 2) {
                that.posY++;
            } else {
                that.posY--;
            }

            var min = -5;
            var max = 5;
            var randomSpeed = Math.floor(Math.random() * (max - min + 1)) + min;

            // Check horizontal edges
            if ((that.posX > window.innerWidth) || (that.posX < 0)) {
                randomSpeed *= -1;
            }
            //Check vertical edges
            if ((that.posY > window.innerHeight) || (that.posY < 0)) {
                randomSpeed *= -1;
            }

            $('#' + that.name).css({
                top: that.posY,
                left: that.posX
            });

        },
        40);
};