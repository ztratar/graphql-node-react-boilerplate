import { inject } from 'injectorator';
import Promise from 'bluebird';

import { isValidURL } from '../functions/validators';
import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import GoogleMapsConnector from '../connectors/google/maps';
import BaseModel from './base';

const { schema: LocationSchema } = createSequelizeSchema('Location', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  googleName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googlePlaceId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleTimezoneId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleTimezoneName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleTimezoneDstOffset: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleTimezoneRawOffset: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleIcon: {
    type: DataTypes.STRING,
    defaultValue: '',
    validate: {
      isValidURL: (value) => value.length < 1 || isValidURL(value),
    }
  },
  googleCoordLat: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  googleCoordLng: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

export {
  LocationSchema
};

@inject({
  LocationSchema: () => LocationSchema,
  SequelizeConnector: () => SequelizeConnector,
  GoogleMapsConnector: () => GoogleMapsConnector
})
export default class LocationModel extends BaseModel {
  constructor ({
    LocationSchema,
    SequelizeConnector,
    MapsConnector
  }, reqUser) {
    super(reqUser);

    this._schema = LocationSchema;

    this._sequelizeConnector = new SequelizeConnector(LocationSchema, 'id');

    this._googleMapsConnector = new GoogleMapsConnector();
  }

  get schema () {
    return this._schema;
  }

  async _create ({ googlePlaceId }, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    const {
      googleId,
      googleName,
      googleCoords: { lat: googleCoordLat, lng: googleCoordLng },
      googleIcon
    } = await this._googleMapsConnector.getPlaceDetails({
      googlePlaceId
    });

    const {
      googleTimezoneId,
      googleTimezoneName,
      googleTimezoneDstOffset,
      googleTimezoneRawOffset
    } = await this._googleMapsConnector.getTimezone({
      googleCoordLat,
      googleCoordLng
    });

    return await this._sequelizeConnector.schema.create({
      googleId,
      googlePlaceId,
      googleName,
      googleCoordLat,
      googleCoordLng,
      googleIcon,
      googleTimezoneId,
      googleTimezoneName,
      googleTimezoneRawOffset,
      googleTimezoneDstOffset
    }, {
      transaction
    });
  }

  create ({ googlePlaceId }, transactionContext) {
    return this.findByGooglePlaceIdOrCreate(googlePlaceId, transactionContext);
  }

  async findByGooglePlaceIdOrCreate (googlePlaceId, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    const location = await this._sequelizeConnector.schema.findOne({
      where: {
        googlePlaceId
      },
      transaction
    });

    return location || await this._create({
      googlePlaceId
    }, transactionContext);
  }

  search (text, transactionContext) {
    return this._googleMapsConnector.autocompletePlaces({
      input: text
    })
  }

  findById (id, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findById(id, {
      transaction
    });
  }

  isInstance (subject) {
    return subject instanceof this._sequelizeConnector.schema.Instance;
  }

  rebuild (inst) {
    return this._sequelizeConnector.schema.build(inst, { isNewRecord: !inst.id });
  }
}
