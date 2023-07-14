import { useCallback, useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { Node, Pipe, Mode } from "../../utils";
import "./PipelineDesigner.css";

export const PipelineDesigner = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.Default);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const addNode = (position: { x: number; y: number }) => {
    const newNode = { x: position.x, y: position.y };
    setNodes((prevNodes) => [...prevNodes, newNode]);

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newPipe = {
        startX: lastNode.x,
        startY: lastNode.y,
        endX: newNode.x,
        endY: newNode.y,
      };
      setPipes((prevPipes) => [...prevPipes, newPipe]);
    }
  };

  const handleStageClick = (e: any) => {
    if (mode === Mode.Add) {
      const position = e.target.getStage().getPointerPosition();
      addNode(position);
    }
  };

  const handleAddNodeClick = () => {
    setMode(Mode.Add);
  };

  const handleRemoveNodeClick = () => {
    if (selectedNode !== null) {
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes];
        newNodes.splice(selectedNode, 1);
        return newNodes;
      });

      setPipes((prevPipes) => {
        const newPipes = [...prevPipes];
        newPipes.splice(selectedNode > 0 ? selectedNode - 1 : 0, 1);
        return newPipes;
      });
    }

    setSelectedNode(null);
  };

  const updatePipes = (index: number) => {
    setPipes((prevPipes) => {
      const updatedPipes = [...prevPipes];

      if (index > 0 || index < nodes.length - 1) {
        if (index > 0) {
          const { x: startX, y: startY } = nodes[index - 1];
          const { x: endX, y: endY } = nodes[index];
          updatedPipes[index - 1] = { startX, startY, endX, endY };
        }

        if (index < nodes.length - 1) {
          const { x: startX, y: startY } = nodes[index];
          const { x: endX, y: endY } = nodes[index + 1];
          updatedPipes[index] = { startX, startY, endX, endY };
        }
      }

      return updatedPipes;
    });
  };

  const handleDragStart = useCallback((e: any) => {
    e.target.scale({ x: 1.5, y: 1.5 });
  }, []);

  const handleDragEnd = useCallback(
    (e: any, index: number) => {
      const newNodes = [...nodes];
      newNodes[index] = {
        x: e.target.x(),
        y: e.target.y(),
      };
      setNodes(newNodes);
      updatePipes(index);
    },
    [nodes, updatePipes]
  );

  const handleDragMove = useCallback(
    (e: any, index: number) => {
      const newNodes = [...nodes];
      newNodes[index] = {
        x: e.target.x(),
        y: e.target.y(),
      };
      setNodes(newNodes);
      updatePipes(index);
    },
    [nodes, updatePipes]
  );

  const handleNodeClick = useCallback(
    (index: number) => {
      return (e: any) => {
        if (index === 0 || index === nodes.length - 1) {
          e.target.scale({ x: 1.5, y: 1.5 });
          setSelectedNode(index);
        }
      };
    },
    [nodes]
  );

  const handleNodeMouseEnter = useCallback((e: any) => {
    e.target.scale({ x: 1.5, y: 1.5 });
  }, []);

  const handleNodeMouseLeave = useCallback(
    (index: number) => {
      return (e: any) => {
        if (index !== selectedNode) {
          e.target.scale({ x: 1, y: 1 });
        }
        updatePipes(index);
      };
    },
    [selectedNode, updatePipes]
  );

  const handleNodeMouseUp = useCallback(
    (index: number) => {
      return () => {
        updatePipes(index);
      };
    },
    [updatePipes]
  );

  return (
    <div>
      <div
        style={{
          backgroundColor: "white",
          border: "black",
          borderStyle: "groove",
        }}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight / 2}
          onClick={handleStageClick}
        >
          <Layer>
            {nodes.map((node, index) => (
              <Circle
                key={index}
                x={node.x}
                y={node.y}
                radius={10}
                fill="black"
                draggable
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleDragEnd(e, index)}
                onDragMove={(e) => handleDragMove(e, index)}
                onClick={handleNodeClick(index)}
                onMouseLeave={handleNodeMouseLeave(index)}
                onMouseEnter={handleNodeMouseEnter}
                onMouseUp={handleNodeMouseUp(index)}
              />
            ))}
            {pipes.map((pipe, index) => (
              <Line
                key={index}
                points={[pipe.startX, pipe.startY, pipe.endX, pipe.endY]}
                stroke="black"
                strokeWidth={3}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div>
        <div>
          {mode === Mode.Add ? (
            <button className="button" onClick={() => setMode(Mode.Default)}>
              Отменить
            </button>
          ) : (
            <button className="button" onClick={handleAddNodeClick}>
              Добавить узел
            </button>
          )}

          {nodes.length > 0 && selectedNode !== null ? (
            <button className="button" onClick={handleRemoveNodeClick}>
              Удалить узел
            </button>
          ) : (
            <button className="button" disabled>
              Удалить узел
            </button>
          )}
        </div>
        <div>
          <h3>Выбранный узел</h3>
          <ul>
            {selectedNode !== null ? <li>{selectedNode + 1}</li> : <li>Нет</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
