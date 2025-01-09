import { Buffer } from 'buffer';

// HL7 Message Segment Types
type HL7Segment = {
  type: string;
  fields: string[];
};

export class HL7Parser {
  private static SEGMENT_SEPARATOR = '\r';
  private static FIELD_SEPARATOR = '|';
  private static COMPONENT_SEPARATOR = '^';

  static parseMessage(message: string): HL7Segment[] {
    return message
      .split(this.SEGMENT_SEPARATOR)
      .filter(Boolean)
      .map(segment => {
        const fields = segment.split(this.FIELD_SEPARATOR);
        return {
          type: fields[0],
          fields: fields.slice(1)
        };
      });
  }

  static generateMessage(segments: HL7Segment[]): string {
    return segments
      .map(segment => 
        [segment.type, ...segment.fields].join(this.FIELD_SEPARATOR)
      )
      .join(this.SEGMENT_SEPARATOR);
  }

  static generateACK(message: string, status: 'AA' | 'AE' | 'AR'): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '');
    const segments: HL7Segment[] = [
      {
        type: 'MSH',
        fields: ['|', '^~\\&', 'CareSync', 'Hospital', timestamp, '', 'ACK', '', 'P', '2.5.1']
      },
      {
        type: 'MSA',
        fields: [status, message]
      }
    ];
    return this.generateMessage(segments);
  }
}

// HL7 to FHIR Converter
export class HL7ToFHIR {
  static convertADT(hl7Message: string): any {
    const segments = HL7Parser.parseMessage(hl7Message);
    const patient: any = {
      resourceType: 'Patient',
      identifier: [],
      name: [],
      telecom: [],
      address: []
    };

    segments.forEach(segment => {
      switch (segment.type) {
        case 'PID':
          // Patient Identification
          patient.identifier.push({
            system: 'HL7v2',
            value: segment.fields[2]
          });
          patient.name.push({
            family: segment.fields[5].split('^')[0],
            given: [segment.fields[5].split('^')[1]]
          });
          break;
        case 'PV1':
          // Patient Visit
          patient.managingOrganization = {
            reference: `Organization/${segment.fields[3]}`
          };
          break;
      }
    });

    return patient;
  }
}