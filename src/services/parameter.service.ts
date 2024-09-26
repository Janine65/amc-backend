import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Parameter } from '@/models/parameter';

@Service()
export class ParameterService {
    public async findAllParameter(): Promise<Parameter[]> {
        const allParameter: Parameter[] = await Parameter.findAll();
        return allParameter;
      }
    
      public async findParameterById(parameterId: string): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findByPk(parameterId);
        if (!findParameter) throw new GlobalHttpException(409, "Parameter doesn't exist");
    
        return findParameter;
      }
    
      public async createParameter(parameterData: Parameter): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findOne({ where: { key: parameterData.key } });
        if (findParameter) throw new GlobalHttpException(409, `This key ${parameterData.key} already exists`);
    
        const createParameterData: Parameter = await Parameter.create(parameterData);
        return createParameterData;
      }
    
      public async updateParameter(parameterId: string, parameterData:Parameter): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findByPk(parameterId);
        if (!findParameter) throw new GlobalHttpException(409, "Parameter doesn't exist");
    
        await Parameter.update(parameterData, { where: { id: parameterId } });
    
        const updateParameter: Parameter|null = await Parameter.findByPk(parameterId);
        return updateParameter!;
      }
    
      public async deleteParameter(parameterId: string): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findByPk(parameterId);
        if (!findParameter) throw new GlobalHttpException(409, "Parameter doesn't exist");
    
        await Parameter.destroy({ where: { id: parameterId } });
    
        return findParameter;
      }
    
}
