HALMA = {};

// Some constants
HALMA.boardWidth = 9;
HALMA.boardHeight = 9;
HALMA.pieceWidth = 50;
HALMA.pieceHeight = 50;

// Determine size of canvas that allows bw*bh pieces
HALMA.canvasWidth = 1 + (HALMA.boardWidth*HALMA.pieceWidth);
HALMA.canvasHeight= 1 + (HALMA.boardHeight*HALMA.pieceHeight);

HALMA.Cell = function(row, column) {
  this.row= row;
  this.column = column;
  
  this.moveTo = function( cell ) {
    this.row = cell.row;
    this.column = cell.column;
  };
}

HALMA.canvasClick = function( event ) {
  
  var cellClicked = HALMA.getCursorPosition( event );
  var i;
  var piece;
  
  for( i = 0; i < HALMA.pieces.length; i++ ) {
    piece = HALMA.pieces[i];
    if( piece.row === cellClicked.row && piece.column === cellClicked.column ) {
      HALMA.pieceClicked( i );
      return;
    }
  }
  HALMA.emptyCellClicked( cellClicked );  
}

HALMA.getCursorPosition = function( event ) {
  var x;
  var y;
  var cell;
  
  if( event.pageX != undefined && event.pageY != undefined ) {
    x = event.pageX;
    y = event.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft 
                  + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop 
                  + document.documentElement.scrollTop;
  }
  x -= HALMA.canvasElement.offsetLeft;
  y -= HALMA.canvasElement.offsetTop;
  
  x = Math.min(x, HALMA.canvasWidth - 1 );
  y = Math.min(y, HALMA.canvasHeight -1 );
  
  cell = new HALMA.Cell( Math.floor(y / HALMA.pieceHeight)
                       , Math.floor(x / HALMA.pieceWidth));
  return cell;
}

HALMA.pieceClicked = function( index ) {
  if( index === HALMA.selectedPieceIndex ) { return; }
  HALMA.selectedPieceIndex = index;
  HALMA.drawBoard();
}

HALMA.isSimpleMove = function( dx, dy ) {
  return (dx <= 1) && (dy <= 1);
}

HALMA.isJump = function(dx, dy) {
  return ((dx == 2) && (dy == 0)) 
      || ((dx == 0) && (dy == 2)) 
      || ((dx == 2) && (dy == 2)); 
}

HALMA.isPieceInbetween = function( p1, p2 ) {
  var centreRow = (p1.row + p2.row) / 2;
  var centreCol = (p1.column + p2.column) / 2;
  var i;
  for( i = 0; i < HALMA.pieces.length; i++ ) {
    if( HALMA.pieces[i].row == centreRow && HALMA.pieces[i].column == centreCol ) {
      return true;
    }
  }
  return false;
}

HALMA.emptyCellClicked = function( cell ) {
  var selectedPiece;
  var dx, dy;
  
  // if nothing selected there is nothing to do
  if( HALMA.selectedPieceIndex === HALMA.nothingSelected ) return;
  
  selectedPiece = HALMA.pieces[HALMA.selectedPieceIndex];
  dx = Math.abs( cell.row - selectedPiece.row );
  dy = Math.abs( cell.column - selectedPiece.column );
  
  if( HALMA.isSimpleMove( dx, dy ) ) {
    selectedPiece.moveTo( cell );
    HALMA.moveCount += 1;
    HALMA.selectedPieceIndex = HALMA.nothingSelected;
    HALMA.drawBoard();
  } else if( HALMA.isJump( dx, dy ) && HALMA.isPieceInbetween( selectedPiece, cell )) {
    selectedPiece.moveTo( cell );
    HALMA.moveCount += 1;
    HALMA.selectedPieceIndex = HALMA.nothingSelected;
    HALMA.drawBoard();
  }
}


HALMA.drawBoard = function() {
  var dc = HALMA.drawingContext;
  var x, y, i;
  
  dc.clearRect( 0, 0, HALMA.canvasWidth, HALMA.canvasHeight );
  
  dc.beginPath();
  
  // Vertical lines
  for(x = 0; x < HALMA.canvasWidth; x += HALMA.pieceWidth ) {
    dc.moveTo( 0.5 + x, 0 );
    dc.lineTo( 0.5 + x, HALMA.canvasHeight );
  }
  
  // Horizontal lines
  for(y = 0; y < HALMA.canvasHeight; y += HALMA.pieceHeight ) {
    dc.moveTo( 0, 0.5 + y );
    dc.lineTo( HALMA.canvasWidth, 0.5 + y );
  }
  
  dc.strokeStyle = '#ddd';
  dc.stroke();
  
  // Now draw each piece
  for(i = 0; i < HALMA.pieces.length; i++ ) {
    HALMA.drawPiece( HALMA.pieces[i], i === HALMA.selectedPieceIndex );
  }
  
  HALMA.moveCountElement.innerHTML = HALMA.moveCount;
  
  HALMA.saveGame();
}

HALMA.drawPiece = function( p, selected ) {
  var dc = HALMA.drawingContext;
  var x = (p.column * HALMA.pieceWidth ) + (HALMA.pieceWidth / 2);
  var y = (p.row * HALMA.pieceHeight ) + (HALMA.pieceHeight / 2);
  var radius = (HALMA.pieceHeight / 2) - (HALMA.pieceHeight / 10);
  
  dc.beginPath();
  dc.arc( x, y, radius, 0, Math.PI * 2, /* clockwise */ false );
  dc.closePath();
  
  dc.strokeStyle = '#000';
  dc.stroke();

  if( selected ) {
    dc.fillStyle = '#000';
    dc.fill();
  }
}
  
HALMA.nothingSelected = -1;
  
HALMA.saveGame = function() {
  var state; 
  
  if( window.localStorage ) {
    state = JSON.stringify(HALMA.pieces);
    localStorage['halma.pieces'] = state; 
    localStorage['halma.moveCount'] = HALMA.moveCount;
  }
}

HALMA.resumeGame = function() { 
  var i;
  if( window.localStorage && localStorage['halma.pieces'] ) {
    HALMA.pieces = JSON.parse( localStorage['halma.pieces'] );
    for( i = 0; i < HALMA.pieces.length; i++ ) {
      HALMA.pieces[i] = new HALMA.Cell( HALMA.pieces[i].row, HALMA.pieces[i].column );
    }
    HALMA.moveCount = parseInt(localStorage['halma.moveCount']);
    return true;
  }
  return false;
}
  
HALMA.newGame = function() {
  
  if( !HALMA.resumeGame() ) {
  
    HALMA.pieces = [ new HALMA.Cell( HALMA.boardHeight - 3, 0 ),
                     new HALMA.Cell( HALMA.boardHeight - 2, 0 ),
                     new HALMA.Cell( HALMA.boardHeight - 1, 0 ),
                     new HALMA.Cell( HALMA.boardHeight - 3, 1 ),
                     new HALMA.Cell( HALMA.boardHeight - 2, 1 ),
                     new HALMA.Cell( HALMA.boardHeight - 1, 1 ),
                     new HALMA.Cell( HALMA.boardHeight - 3, 2 ),
                     new HALMA.Cell( HALMA.boardHeight - 2, 2 ),
                     new HALMA.Cell( HALMA.boardHeight - 1, 2 )
      ];
    
    HALMA.selectedPieceIndex = HALMA.nothingSelected;    
    HALMA.moveCount = 0;
  }
  HALMA.drawBoard();
}

// Create game area
HALMA.initGame = function(event) {
  HALMA.canvasElement = document.createElement('canvas');
  HALMA.canvasElement.id = 'halma_canvas';
  HALMA.canvasElement.width = HALMA.canvasWidth;
  HALMA.canvasElement.height = HALMA.canvasHeight;
  
  HALMA.canvasElement.addEventListener('click', HALMA.canvasClick, false );
  
  document.body.appendChild( HALMA.canvasElement);
  HALMA.moveCountElement = document.createElement('p');
  document.body.appendChild( HALMA.moveCountElement );
  HALMA.drawingContext = HALMA.canvasElement.getContext('2d');
  HALMA.newGame();
}

window.addEventListener('load', HALMA.initGame, false);