import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Parameter } from '@/models/parameter';
import { systemVal } from '@/utils/system';

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
    
        const createParameterData = await Parameter.build(parameterData, {isNewRecord: true});
        createParameterData.id = undefined;
        await createParameterData.save();
        
        systemVal.params.set(createParameterData.key, createParameterData.value);
        return createParameterData;
      }
    
      public async updateParameter(parameterId: string, parameterData:Parameter): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findByPk(parameterId);
        if (!findParameter) throw new GlobalHttpException(409, "Parameter doesn't exist");
    
        await Parameter.update(parameterData, { where: { id: parameterId } });
    
        const updateParameter: Parameter|null = await Parameter.findByPk(parameterId);
        systemVal.params.set(updateParameter!.key, updateParameter!.value);
        return updateParameter!;
      }
    
      public async deleteParameter(parameterId: string): Promise<Parameter> {
        const findParameter: Parameter|null = await Parameter.findByPk(parameterId);
        if (!findParameter) throw new GlobalHttpException(409, "Parameter doesn't exist");
    
        await Parameter.destroy({ where: { id: parameterId } });
        systemVal.params.delete(findParameter.key);
        return findParameter;
      }
    
}
