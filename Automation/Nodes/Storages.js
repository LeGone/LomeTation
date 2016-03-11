/**************************************************************************
 * STORAGES
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
wcNodeStorage.extend('NodeStorageColor', 'Color', 'Local',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Stores a color value.");

    this.createProperty('red', wcPlay.PROPERTY.NUMBER, '', {input: true, output: true});
    this.createProperty('green', wcPlay.PROPERTY.NUMBER, '', {input: true, output: true});
    this.createProperty('blue', wcPlay.PROPERTY.NUMBER, '', {input: true, output: true});
  },
});