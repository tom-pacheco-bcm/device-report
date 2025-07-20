

class Client implements IClient {

  Version: string = "";

  ValueStatus!: typeof ValueStatusEnum;
  LogCalculationMethod!: typeof LogCalculationMethodEnum;
  LogCalculationPeriod!: typeof LogCalculationPeriodEnum;
  AlarmAction!: typeof AlarmActionEnum;
  AlarmState!: typeof AlarmStateEnum;
  ReadFileResponseType!: typeof ReadFileResponseTypeEnum;


  getObjectPath(): Promise<string> {
    return fetch('/static/mock/getObjectPath.txt')
      .then(r => r.text())
  }

  resolveRelativePath(relativePath: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getChildren(objectPath: string, includePropertyNames?: boolean): Promise<ChildInfo[]> {
    return fetch(`/static/mock${objectPath}/getChildren.json`)
      .then(r => r.json())
      .catch(() => {
        throw new Error(`Method not implemented for path ${objectPath}`);
      })
  }
  getObject(objectPath: string): Promise<ObjectInfo> {
    throw new Error("Method not implemented.");
  }

  getObjects(objectPaths: string[]): Promise<Map<string, ObjectInfo>> {
    throw new Error("Method not implemented.");
  }

  getReferences(propertyPaths: string[], objectPaths: string[]): Promise<Map<string, ReferenceInfo>> {
    throw new Error("Method not implemented.");
  }

  getUserSettings(): Promise<UserSettings> {
    throw new Error("Method not implemented.");
  }

  subscribeValues(callback: (result: Map<string, Value>, subscriptionId: number) => void, propertyPaths: string[]): Promise<number> {
    const result = new Map<string, Value>()
    Promise.allSettled(propertyPaths
      .map(path =>
        fetch(`/static/mock${path}/subscribeValues.json`)
          .then(r => r.json())
          .then(j => ({ path: path, value: j }))
      )
    ).then(prs => {
      prs.forEach(pr => {
        if (pr.status === "fulfilled") {
          result.set(pr.value.path, pr.value.value)
        }
      })
      callback(result, 1)
    })
    return Promise.resolve(1)
  }

  unsubscribeValues(subscriptionId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  readValues(propertyPaths: string[], maxWait?: number): Promise<Map<string, Value>> {
    return Promise.allSettled(propertyPaths
      .map(path =>
        fetch(`/static/mock${path}/readValues.json`)
          .then(r => r.json())
          .then(j => ({ path: path, value: j }))
      )
    ).then(prs => {
      const result = new Map<string, Value>()
      prs.forEach(pr => {
        if (pr.status === "fulfilled") {
          result.set(pr.value.path, pr.value.value)
        }
      })
      return result
    })
  }

  setValue(propertyPath: string, value: boolean | string | number | Date): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setForce(propertyPath: string, force: boolean, forcedUntil?: Date): Promise<void> {
    throw new Error("Method not implemented.");
  }

  invoke(objectPath: string, action: string, pageX: number, pageY: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  editProperties(propertyPaths: string[], dialogConfiguration?: DialogConfiguration): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showMenu(propertyPaths: string[], objectPaths: string[], pageX: number, pageY: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showLinksMenu(propertyPaths: string[], objectPaths: string[], pageX: number, pageY: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showList(propertyPaths: string[], objectPaths: string[], title: string, action: string, pageX: number, pageY: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  subscribeLog(callback: (result: LogValue[], unit: string, subscriptionId: number) => void, logPath: string, startAt: Date, endAt?: Date, calculation?: LogCalculation): Promise<number> {
    throw new Error("Method not implemented.");
  }

  unsubscribeLog(logId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  importToLog(logPath: string, logValues: AddLogValue[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addLogValue(logPath: string, logValue: AddLogValue): Promise<void> {
    throw new Error("Method not implemented.");
  }

  editLogValue(logPath: string, logValue: LogValue, edit: EditLogValue): Promise<void> {
    throw new Error("Method not implemented.");
  }

  clearLog(logPath: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  subscribeAlarmView(callback: (result: ReadonlyArray<RecordInfo>) => void, presentationValue?: boolean, alarmViewPath?: string, favorite?: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  performAlarmAction(action: AlarmActionEnum, record: RecordInfo, alarmViewId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unsubscribeAlarmView(alarmViewId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  subscribeEventView(callback: (result: ReadonlyArray<RecordInfo>) => void, presentationValue?: boolean, eventViewPath?: string, favorite?: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  unsubscribeEventView(eventViewId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  readFile(objectPath: string): Promise<string>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.Text): Promise<string>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.Blob): Promise<Blob>;
  readFile(objectPath: string, responseType: ReadFileResponseTypeEnum.ArrayBuffer): Promise<ArrayBuffer>;
  readFile(objectPath: string, responseType?: ReadFileResponseTypeEnum): Promise<string | Blob | ArrayBuffer> {
    return fetch(`/static/mock${objectPath}/readFile.txt`)
      .then(r =>
        responseType == 1 ? r.arrayBuffer() :
          responseType == 2 ? r.blob() :
            r.text() as Promise<string | Blob | ArrayBuffer>
      )
  }

  subscribeSegments(callback: (result: Readonly<ISegmentCollection>) => void, paths: string[], includePoints?: boolean): Promise<number> {
    throw new Error("Method not implemented.");
  }

  createGroup(segmentsId: number, members: ISegment[], masterSegment?: ISegment): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addToGroup(segmentsId: number, existingMember: ISegment, members: ISegment[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeFromGroup(segmentsId: number, members: ISegment[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeGroup(segmentsId: number, existingMember: ISegment): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unsubscribeSegments(segmentsId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  importScript(objectPath: string) {
    throw new Error("Method not implemented.");
  }

  sparqlQuery(query: string): Promise<SparqlResult> {
    throw new Error("Method not implemented.");
  }

  resolveNspGuids(nspGuids: string[]): Promise<NspGuidResult[]> {
    throw new Error("Method not implemented.");
  }

  alert(message: string, header?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  confirm(message: string, header?: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  prompt<T extends boolean | string | number>(prompt: string, header?: string, defaultValue?: T, options?: T[]): Promise<T> {
    throw new Error("Method not implemented.");
  }
}
const clientAPI: IClient = new Client();

(globalThis as any).client = clientAPI;

export default clientAPI;
